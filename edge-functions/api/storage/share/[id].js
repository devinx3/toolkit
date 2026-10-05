// 脚本分享读取接口：GET /api/storage/share/:id
// 出参: { code, message, data: { content } } 或错误 { code, message }
// 管理接口: DELETE /api/storage/share/admin:expire （清理全部过期分享，需 x-admin-token 鉴权）
// 逻辑与响应规范见 lib.js

import { getShare, okResponse, errorResponse, deleteAllExpireShare } from './lib.js';

// 恒定时间字符串比较，防止通过响应耗时逐字节猜解 token
function timingSafeEqual(a, b) {
    const enc = new TextEncoder();
    const bufA = enc.encode(a ?? '');
    const bufB = enc.encode(b ?? '');
    // XOR 累积全部字节差异（含长度差），最后统一判断
    let diff = bufA.length ^ bufB.length;
    const len = Math.max(bufA.length, bufB.length);
    for (let i = 0; i < len; i++) {
        diff |= (bufA[i] ?? 0) ^ (bufB[i] ?? 0);
    }
    return diff === 0;
}

function adminAuth(context) {
    // 管理操作鉴权：环境变量 ADMIN_TOKEN 非空时，要求请求头 x-admin-token 匹配；
    // 未配置时放行（便于本地调试，线上配置后自动生效）
    const adminToken = context.env?.ADMIN_TOKEN;
    if (!adminToken || !timingSafeEqual(context.request.headers.get('x-admin-token'), adminToken)) {
        return errorResponse('UNAUTHORIZED');
    }
    return null;
}

async function clearExpire(context) {
    try {
        const count = await deleteAllExpireShare();
        return okResponse({ count: count }, '删除分享成功');
    } catch (e) {
        console.error('KV operation failed:', e);
        return errorResponse('INTERNAL_ERROR');
    }
}

export async function onRequestGet(context) {
    try {
        const result = await getShare(context.params?.id);
        if (result.error) {
            return errorResponse(result.error);
        }
        return okResponse({ content: result.content }, '获取分享成功');
    } catch (e) {
        console.error('KV operation failed:', e);
        return errorResponse('READ_FAILED');
    }
}

export async function onRequestDelete(context) {
    let key = context.params?.id || "";
    if (key.startsWith("admin:")) {
        // 用户认证
        const failedAuth = adminAuth(context);
        if (failedAuth) return failedAuth;
    }
    switch (key) {
        case "admin:expire": return await clearExpire(context);
        default: return errorResponse('NO_RESOURCE');
    }
}