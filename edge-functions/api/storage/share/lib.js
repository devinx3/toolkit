// 分享记录的生成与读取逻辑（供 edge-functions/api/storage/share 下的接口复用）
// 存储结构：KV key = "share_<shareId>"，value = JSON { content, expireDay }
// 需在控制台绑定 KV 命名空间，变量名为 TOOLKIT_SHARE

const KV_PREFIX = 'share_';
// 分享有效天数
const EXPIRE_DAYS = 31;
// 86400000 = 一天的毫秒数
const DAY_MS = 86400000;

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
  });
}


function generateShareId() {
  return crypto.randomUUID().replaceAll('-', '').toLowerCase();
}

// 生成分享：入参为脚本文本，返回 { shareId }
export async function createShare(content) {
  const expireDay = Math.floor(Date.now() / DAY_MS) + EXPIRE_DAYS;
  const record = JSON.stringify({ content, expireDay });

  // 重试最多 3 次，避免 shareId 极小概率冲突
  for (let times = 0; times < 3; times++) {
    const shareId = generateShareId();
    const key = KV_PREFIX + shareId;
    const existing = await TOOLKIT_SHARE.get(key);
    if (existing !== null && existing !== undefined) {
      continue; // key 已被占用，换一个重试
    }
    await TOOLKIT_SHARE.put(key, record);
    return { shareId };
  }
  return { error: '分享创建失败，请重试' };
}

// 获取分享：入参为分享 ID，返回 { content } 或 { error, status }
export async function getShare(shareId) {
  if (!shareId) {
    return { error: '分享 ID 不合法', status: 400 };
  }

  const raw = await TOOLKIT_SHARE.get(KV_PREFIX + shareId);
  if (!raw) {
    return { error: '分享不存在或已过期', status: 404 };
  }

  const record = JSON.parse(raw);
  // 过期判断按 epoch 天数：当前天数超过记录的过期天数即过期（UTC 日界）
  if (record?.expireDay && Math.floor(Date.now() / DAY_MS) > record.expireDay) {
    // 已过期：删除记录并返回 404
    await TOOLKIT_SHARE.delete(KV_PREFIX + shareId);
    return { error: '分享不存在或已过期', status: 404 };
  }

  return { content: record.content };
}

export { jsonResponse };
