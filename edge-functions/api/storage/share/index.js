// 脚本分享存储接口：POST /api/storage/share
// 入参: { content: string }
// 出参: { code, message, data: { shareId } }
// 逻辑与响应规范见 lib.js

import { createShare, okResponse, errorResponse } from './lib.js';

export async function onRequestPost(context) {
  const { request } = context;

  let content;
  try {
    const body = await request.json();
    content = body?.content;
  } catch (e) {
    return errorResponse('BAD_REQUEST');
  }

  if (typeof content !== 'string' || content.length === 0) {
    return errorResponse('BAD_REQUEST');
  }

  try {
    const result = await createShare(content);
    if (result.error) {
      return errorResponse(result.error);
    }
    return okResponse({ shareId: result.shareId }, '分享创建成功');
  } catch (e) {
    console.error('KV operation failed:', e);
    return errorResponse('CREATE_FAILED');
  }
}
