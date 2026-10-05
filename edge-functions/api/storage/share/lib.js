// 分享记录的生成与读取逻辑（供 edge-functions/api/storage/share 下的接口复用）
// 存储结构：KV key = "share_<shareId>"，value = JSON { content, expireDay }
// 需在控制台绑定 KV 命名空间，变量名为 TOOLKIT_SHARE

const KV_PREFIX = 'share_';
// 分享有效天数
const EXPIRE_DAYS = 31;
// 86400000 = 一天的毫秒数
const DAY_MS = 86400000;

// 统一的响应消息：code + message，前后端共用同一套文案
// 错误分级：参数错误 400 / 业务规则失败 422 / 系统异常 500
const MESSAGES = {
  BAD_REQUEST: { status: 400, code: 'BAD_REQUEST', message: '请求参数不合法' },
  NO_RESOURCE: { status: 404, code: 'NO_RESOURCE', message: '资源不存在' },
  NOT_FOUND: { status: 404, code: 'NOT_FOUND', message: '分享不存在或已过期' },
  RULE_CONFLICT: { status: 422, code: 'RULE_CONFLICT', message: '业务规则校验失败' },
  CREATE_FAILED: { status: 500, code: 'CREATE_FAILED', message: '分享创建失败，请重试' },
  READ_FAILED: { status: 500, code: 'READ_FAILED', message: '读取分享失败' },
  UNAUTHORIZED: { status: 401, code: 'UNAUTHORIZED', message: '认证失败' },
  INTERNAL_ERROR: { status: 500, code: 'INTERNAL_ERROR', message: '服务器内部错误' },
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
  });
}

// 统一错误响应：{ code, message, data? }，HTTP 状态码由错误定义携带
function errorResponse(code, data) {
  const m = MESSAGES[code] || MESSAGES.INTERNAL_ERROR;
  return jsonResponse(
    { code: m.code, message: m.message, ...(data !== undefined ? { data } : {}) },
    m.status
  );
}

// 统一成功响应：{ code: 'OK', message, data }
function okResponse(data, message = 'success') {
  return jsonResponse({ code: 'OK', message, data }, 200);
}

function generateShareId() {
  return crypto.randomUUID().replaceAll('-', '').toLowerCase();
}

// 生成分享：入参为脚本内容，返回 { shareId }
export async function createShare(content) {
  const expireDay = calculateDay() + EXPIRE_DAYS;
  const record = { content, expireDay };

  // 重试最多 3 次，避免 shareId 极小概率冲突
  for (let times = 0; times < 3; times++) {
    const shareId = generateShareId();
    const existing = await shareStore.get(shareId);
    if (existing !== null && existing !== undefined) {
      continue; // key 已被占用，换一个重试
    }
    await shareStore.put(shareId, record);
    return { shareId };
  }
  return { error: 'CREATE_FAILED' };
}

// 获取分享：入参为分享 ID，返回 { content } 或 { error }（错误码见 MESSAGES，状态码由 errorResponse 映射）
export async function getShare(shareId) {
  if (!shareId) {
    return { error: 'BAD_REQUEST' };
  }

  const record = await shareStore.get(shareId);
  if (!record) {
    return { error: 'NOT_FOUND' };
  }

  // 过期判断按 epoch 天数：当前天数超过记录的过期天数即过期（UTC 日界）
  if (record?.expireDay && calculateDay() > record.expireDay) {
    // 已过期：删除记录并返回 404
    await shareStore.delete(shareId);
    return { error: 'NOT_FOUND' };
  }

  return { content: record.content };
}

function calculateDay(time = Date.now()) {
  // offset 2024
  return Math.floor(time / DAY_MS) - 20000;
}

export async function deleteAllExpireShare() {
  // 先收集后删除：边遍历边删除会移动分页游标，导致漏删
  let expiredIds = [];
  await shareStore.list(async shareId => {
    let record = await shareStore.get(shareId);
    if (record?.expireDay && calculateDay() > record.expireDay) {
      expiredIds.push(shareId);
    }
  });
  for (const shareId of expiredIds) {
    await shareStore.delete(shareId);
  }
  return expiredIds.length;
}

const shareStore = {
  get: async (shareId) => {
    let value = await TOOLKIT_SHARE.get(KV_PREFIX + shareId, "json");
    // 兼容历史格式 { content, expireDay } 与当前格式 { c, e }
    if (!value) return value;
    const content = value.c ?? value.content;
    const expireDay = value.e ?? value.expireDay;
    return content === undefined ? undefined : { content, expireDay };
  },
  put: async (shareId, value) => {
    // 存储精简格式 { c: content, e: expireDay }，与 get 对应
    let newValue = { c: value.content, e: value.expireDay };
    return await TOOLKIT_SHARE.put(KV_PREFIX + shareId, JSON.stringify(newValue));
  },
  delete: async (shareId) => {
    return await TOOLKIT_SHARE.delete(KV_PREFIX + shareId);
  },
  list: async (callback) => {
    let result;
    let cursor;
    const option = { prefix: KV_PREFIX };
    do {
      if (typeof cursor === 'string') {
        option.cursor = cursor;
      }
      result = await TOOLKIT_SHARE.list(option);
      cursor = result?.cursor;
      // keys 元素可能为字符串或对象（如 { key: 'share_x' }），统一取 key 字符串
      for (const entry of (result?.keys ?? [])) {
        const key = entry?.key;
        if (key?.startsWith(KV_PREFIX)) {
          await callback(key.slice(KV_PREFIX.length));
        }
      }
    } while (result && !result.complete);
  }
}

export { okResponse, errorResponse, MESSAGES };
