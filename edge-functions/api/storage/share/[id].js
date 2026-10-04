// 脚本分享读取接口：GET /api/storage/share/:id
// 出参: { code, message, data: { content } } 或错误 { code, message }
// 逻辑与响应规范见 lib.js

import { getShare, okResponse, errorResponse, deleteAllExpireShare } from './lib.js';

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
    let key = context.params?.id;
    if (key != 'expire') {
        return errorResponse('NO_RESOURCE');
    }
    try {
        const count = await deleteAllExpireShare();
        return okResponse({ count: count }, '删除分享成功');
    } catch (e) {
        console.error('KV operation failed:', e);
        return errorResponse('INTERNAL_ERROR');
    }
}