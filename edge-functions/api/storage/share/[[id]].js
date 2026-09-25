// 脚本分享读取接口：GET /api/storage/share/:id
// 出参: { content: string } 或 404

import { getShare, jsonResponse } from './lib.js';

export async function onRequestGet(context) {
    try {
        const result = await getShare(context.params?.id);
        if (result.error) {
            return jsonResponse({ error: result.error }, result.status);
        }
        return new Response(result.content, {
            status: 200,
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        });
    } catch (e) {
        console.error('KV operation failed:', e);
        return jsonResponse({ error: '读取分享失败' }, 500);
    }
}
