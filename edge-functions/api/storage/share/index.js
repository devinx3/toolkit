// 脚本分享存储接口：POST /api/storage/share
// 入参: { content: string }
// 出参: { shareId: string }
// 逻辑见 lib.js

import { createShare, jsonResponse } from './lib.js';

export async function onRequestPost(context) {
  const { request } = context;

  let content;
  try {
    const body = await request.json();
    content = body?.content;
  } catch (e) {
    return jsonResponse({ error: '请求体不是合法 JSON' }, 400);
  }

  if (typeof content !== 'string' || content.length === 0) {
    return jsonResponse({ error: '缺少参数' }, 400);
  }

  try {
    const result = await createShare(content);
    if (result.error) {
      return jsonResponse({ error: result.error }, 500);
    }
    return jsonResponse({ shareId: result.shareId });
  } catch (e) {
    console.error('KV operation failed:', e);
    return jsonResponse({ error: '分享创建失败，请重试' }, 500);
  }
}
