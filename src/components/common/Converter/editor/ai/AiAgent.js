/**
 * Agent 包装器 — 原生 ReAct Agent
 *
 * 直接通过 fetch() 调用 OpenAI 兼容 API，手工实现
 * "思考 → 行动 → 观察 → 继续" 的 ReAct 模式。
 *
 */

// ─── SSE 流式解析 ──────────────────────────────────────────────
// 从 OpenAI 兼容的 /chat/completions stream 中逐个提取 delta 事件
async function* parseSSE(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // 保留未完成的行

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') return;
        try {
          yield JSON.parse(data);
        } catch { /* 忽略无法解析的 chunk */ }
      }
    }
    // 处理 buffer 中最后的残余
    if (buffer.trim()) {
      const trimmed = buffer.trim();
      if (trimmed.startsWith('data: ')) {
        const data = trimmed.slice(6);
        if (data !== '[DONE]') {
          try { yield JSON.parse(data); } catch { /* ignore */ }
        }
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }
}

/**
 * 发送流式请求到 OpenAI 兼容 API，逐 token 产出格式化事件
 *
 * @generator
 * @yields {{ type: string, content?: string, id?: string, name?: string, args?: object, result?: string, finish_reason?: string }}
 */
async function* streamLLM({ messages, tools, config, signal }) {
  const body = {
    model: config.model,
    messages,
    stream: true,
    temperature: 0.1,
  };
  if (tools && tools.length > 0) {
    body.tools = tools.map(t => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.schema || { type: 'object', properties: {}, additionalProperties: false },
      },
    }));
  }

  const response = await fetch(config.baseURL.replace(/\/+$/, '') + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.secretKey}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`API ${response.status}: ${errText || response.statusText}`);
  }

  // SSE 流式解析 — 累积 tool_calls（按 index 分组）
  const toolCallAccum = {}; // index → { id, name, args }
  let contentAccum = '';
  let finishReason = null;

  for await (const chunk of parseSSE(response)) {
    const choice = chunk.choices?.[0];
    if (!choice) continue;

    const delta = choice.delta || {};

    // 文本 token
    if (delta.content) {
      contentAccum += delta.content;
      yield { type: 'text', content: delta.content };
    }

    // tool_calls delta（可能跨多个 chunk 累积）
    if (delta.tool_calls) {
      for (const tc of delta.tool_calls) {
        const idx = tc.index;
        if (!toolCallAccum[idx]) toolCallAccum[idx] = { id: null, name: '', args: '' };
        if (tc.id) toolCallAccum[idx].id = tc.id;
        if (tc.function?.name) toolCallAccum[idx].name += tc.function.name;
        if (tc.function?.arguments) toolCallAccum[idx].args += tc.function.arguments;
      }
    }

    if (choice.finish_reason) {
      finishReason = choice.finish_reason;
    }
  }

  // 组装完成的 assistant message
  const assistantMsg = { role: 'assistant', content: contentAccum || null };

  const resolvedToolCalls = Object.values(toolCallAccum)
    .filter(tc => tc.name)
    .map(tc => ({
      id: tc.id || `${tc.name}_${Date.now()}`,
      name: tc.name,
      args: (() => {
        try { return JSON.parse(tc.args); }
        catch { return {}; }
      })(),
    }));

  if (resolvedToolCalls.length > 0) {
    assistantMsg.tool_calls = resolvedToolCalls.map(tc => ({
      id: tc.id,
      type: 'function',
      function: { name: tc.name, arguments: JSON.stringify(tc.args) },
    }));
  }

  yield { type: 'assistant_message', message: assistantMsg, finish_reason: finishReason };

  // 逐个 yield tool_call 事件
  for (const tc of resolvedToolCalls) {
    yield { type: 'tool_call', id: tc.id, name: tc.name, args: tc.args };
  }
}

// ─── 工具定义 ─────────────────────────────────────────────────

function buildEditorTools(getEditor, category) {
  const tools = [];
  const isUI = category && category.startsWith('customize');

  tools.push({
    name: 'readCode',
    description: '读取编辑器中的全部代码内容。当你需要查看用户正在编辑的完整代码时使用。',
    schema: { type: 'object', properties: {}, additionalProperties: false },
    func: async () => {
      const editor = getEditor ? getEditor() : null;
      return editor?.getValue() || '（编辑器不可用）';
    },
  });

  tools.push({
    name: 'findCode',
    description: '在编辑器中搜索指定的代码片段、函数名、变量名或关键词，返回匹配的行号和内容。当你要定位特定代码位置而不是读取全部代码时使用。',
    schema: {
      type: 'object',
      properties: {
        pattern: { type: 'string', description: '要搜索的关键词或代码片段' },
      },
      required: ['pattern'],
      additionalProperties: false,
    },
    func: async ({ pattern }) => {
      const editor = getEditor ? getEditor() : null;
      if (!editor) return '（编辑器不可用）';
      const model = editor.getModel();
      if (!model) return '（编辑器模型不可用）';
      const matches = model.findMatches(pattern, false, false, false, null, true);
      if (!matches || matches.length === 0) {
        return `未找到匹配 "${pattern}" 的代码。`;
      }
      const lines = matches.slice(0, 30).map(m => {
        const lineNum = m.range.startLineNumber;
        const lineContent = model.getLineContent(lineNum).trim();
        return `第 ${lineNum} 行: ${lineContent.slice(0, 200)}`;
      });
      let result = `找到 ${matches.length} 处匹配 "${pattern}"：\n`;
      result += lines.join('\n');
      if (matches.length > 30) {
        result += `\n...及另外 ${matches.length - 30} 处匹配`;
      }
      return result;
    },
  });

  tools.push({
    name: 'writeCode',
    description: '将生成的代码写入编辑器。如果不指定 target，替换全部内容；如果指定 target，只替换匹配到的第一处代码。与 findCode 配合使用：先用 findCode 定位，再用 writeCode 替换。',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: '要写入的代码' },
        target: { type: 'string', description: '（可选）要替换的目标代码片段。如果不提供则替换编辑器全部内容。' },
      },
      required: ['code'],
      additionalProperties: false,
    },
    func: async ({ code, target }) => {
      const editor = getEditor ? getEditor() : null;
      if (!editor) return '（编辑器不可用，请告知用户手动复制代码）';
      const model = editor.getModel();
      if (!model) return '（编辑器模型不可用）';

      if (target) {
        const matches = model.findMatches(target, false, false, false, null, true);
        if (!matches || matches.length === 0) {
          return `未找到匹配的目标代码，无法替换。请改用不带 target 的 writeCode 替换全部内容，或检查 target 是否准确。`;
        }
        const range = matches[0].range;
        editor.executeEdits('agent', [
          { range, text: code, forceMoveMarkers: true },
        ]);
        return `✅ 代码已更新（第 ${range.startLineNumber} 行）。`;
      }

      const fullRange = model.getFullModelRange();
      editor.executeEdits('agent', [
        { range: fullRange, text: code, forceMoveMarkers: true },
      ]);
      return '✅ 代码已更新。';
    },
  });

  tools.push({
    name: 'reviewCode',
    description: '仅当用户明确要求审查代码时调用。提供代码审查的检查维度清单，帮助分析代码的安全性、性能、可维护性等。',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: '（可选）要审查的代码片段。如果不传，LLM 应先用 readCode 读取编辑器中的代码。' },
      },
      additionalProperties: false,
    },
    func: async () => {
      return [
        '请按以下维度对代码进行审查：',
        '',
        '1. **安全性（Security）**',
        '   - 是否存在 XSS、注入等安全风险',
        '   - 用户输入是否经过合理校验和转义',
        '   - 敏感信息（密钥、token）是否硬编码',
        '',
        '2. **性能（Performance）**',
        '   - 是否存在不必要的重复计算或渲染',
        '   - 循环和递归是否有合理的终止条件',
        '   - 大数据量操作是否有优化空间',
        '',
        '3. **可维护性（Maintainability）**',
        '   - 函数/组件是否职责单一，长度是否合理',
        '   - 变量和函数命名是否清晰表达意图',
        '   - 是否存在魔法数字或硬编码字符串',
        '',
        '4. **健壮性（Robustness）**',
        '   - 是否存在潜在的空指针或类型错误',
        '   - 边界条件是否处理（空值、极限值、异常情况）',
        '   - 异步操作是否有适当的错误处理',
        '',
        '5. **最佳实践（Best Practices）**',
        '   - 是否符合项目使用的框架和语言规范',
        '   - 是否存在废弃 API 或已知反模式',
        '   - 代码是否简洁，避免过度设计',
        '',
        '请按上述维度逐项分析代码，指出发现的问题和改进建议。',
      ].join('\n');
    },
  });

  if (isUI) {
    tools.push({
      name: 'frontendDesign',
      description: '提供 UI 设计规范和 antd 最佳实践，帮助生成美观、一致的用户界面。在生成 UI 代码前调用此工具获取设计指导。',
      schema: {
        type: 'object',
        properties: {
          requirement: { type: 'string', description: '（可选）要设计的 UI 功能描述。' },
        },
        additionalProperties: false,
      },
      func: async () => {
        return [
          '请遵循以下 UI 设计规范来生成界面代码：',
          '',
          '## 1. 布局策略',
          '- 使用 antd 的 Row + Col 栅格系统进行页面布局，优先用 flex 布局而非绝对定位',
          '- 保持合理的间距：卡片内 padding 16-24px，卡片间 gap 12-16px',
          '- 重要操作放在页面/卡片的上方或右侧，次要操作折叠或放在底部',
          '',
          '## 2. 组件选用',
          '- 信息展示：Card / Descriptions / Table / Statistic / Tag',
          '- 数据录入：Form / Input / Select / Upload / DatePicker',
          '- 操作触发：Button / Menu',
          '- 反馈提示：message / Notification / Modal / Alert / Spin',
          '- 布局容器：Card / Collapse / Tabs / Steps / Space',
          '',
          '## 3. 视觉风格',
          '- 使用 antd 的 design token 保持一致性',
          '- 图标使用 @ant-design/icons，语义匹配',
          '- 卡片使用 ProCard（支持 header、extra、collapsible）',
          '',
          '## 4. 用户体验',
          '- 操作有 Loading 状态，避免用户重复点击',
          '- 删除/危险操作需二次确认',
          '- 表单提交有成功/失败反馈',
          '- 空数据展示 Empty 组件，错误展示 Result 组件',
          '',
          '请按以上规范设计 UI 代码，确保界面美观、交互完整、风格一致。',
        ].join('\n');
      },
    });

    tools.push({
      name: 'findUiComponents',
      description: '查询项目已安装的 UI 组件库（antd 5.6.1、@ant-design/pro-components 2.5.11）的内置组件列表和能力。支持搜索关键词。',
      schema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: '搜索关键词，例如 "二维码"、"表格"、"ProTable" 等。' },
        },
        additionalProperties: false,
      },
      func: async ({ query }) => {
        const antdComponents = [
          { source: 'antd', name: 'QRCode', desc: '二维码生成。直接使用 <QRCode value="..." /> 即可' },
          { source: 'antd', name: 'Image', desc: '图片展示 + 相册预览' },
          { source: 'antd', name: 'Upload', desc: '文件上传，支持拖拽、裁剪' },
          { source: 'antd', name: 'Table', desc: '表格，自带排序、筛选、分页' },
          { source: 'antd', name: 'Form', desc: '表单，自带校验 rules、布局、联动' },
          { source: 'antd', name: 'DatePicker / TimePicker', desc: '日期/时间选择器' },
          { source: 'antd', name: 'Modal', desc: '模态对话框' },
          { source: 'antd', name: 'Drawer', desc: '侧边抽屉面板' },
          { source: 'antd', name: 'Steps', desc: '步骤条向导' },
          { source: 'antd', name: 'Tabs', desc: '标签页/选项卡' },
          { source: 'antd', name: 'Collapse', desc: '折叠面板' },
          { source: 'antd', name: 'Tree / TreeSelect', desc: '树形控件/树选择' },
          { source: 'antd', name: 'Transfer', desc: '穿梭框' },
          { source: 'antd', name: 'Rate', desc: '评分组件' },
          { source: 'antd', name: 'Progress', desc: '进度条' },
          { source: 'antd', name: 'Carousel', desc: '轮播图' },
          { source: 'antd', name: 'Watermark', desc: '水印组件' },
          { source: 'antd', name: 'Statistic', desc: '统计数值展示' },
          { source: 'antd', name: 'Descriptions', desc: '描述列表' },
          { source: 'antd', name: 'Empty', desc: '空状态占位' },
          { source: 'antd', name: 'Skeleton', desc: '骨架屏加载占位' },
          { source: 'antd', name: 'Result', desc: '结果页（成功/失败/403/404/500）' },
          { source: 'antd', name: 'ColorPicker', desc: '颜色选择器' },
          { source: 'antd', name: 'Segmented', desc: '分段控制器' },
          { source: 'antd', name: 'FloatButton', desc: '浮动按钮' },
          { source: 'antd', name: 'Badge / Ribbon', desc: '徽标/缎带' },
          { source: 'antd', name: 'Alert', desc: '警告提示横幅' },
          { source: 'antd', name: 'Notification', desc: '通知提醒' },
          { source: 'antd', name: 'Popover / Tooltip / Popconfirm', desc: '弹出层/工具提示/确认弹窗' },
          { source: 'antd', name: 'AutoComplete', desc: '自动补全输入框' },
          { source: 'antd', name: 'Cascader', desc: '级联选择' },
          { source: 'antd', name: 'Slider', desc: '滑动输入条' },
          { source: 'antd', name: 'Switch', desc: '开关切换' },
          { source: 'antd', name: 'Input / TextArea', desc: '文本输入框' },
          { source: 'antd', name: 'Select', desc: '下拉选择器' },
          { source: 'antd', name: 'Tag', desc: '标签' },
          { source: 'antd', name: 'message', desc: '全局消息提示（api 调用 message.success()）' },
          { source: 'antd', name: 'Spin', desc: '加载中' },
        ];
        const proComponents = [
          { source: '@ant-design/pro-components', name: 'ProTable', desc: '高级表格，自带查询表单、列设置、导出' },
          { source: '@ant-design/pro-components', name: 'ProForm', desc: '高级表单，支持 Schema 模式、Modal 表单' },
          { source: '@ant-design/pro-components', name: 'ProCard', desc: '高级卡片容器，支持分组、折叠' },
          { source: '@ant-design/pro-components', name: 'ProDescriptions', desc: '高级描述列表，支持编辑' },
          { source: '@ant-design/pro-components', name: 'ProLayout', desc: '高级布局，自带侧边栏、顶栏' },
          { source: '@ant-design/pro-components', name: 'ProList', desc: '高级列表，支持多种视图切换' },
        ];

        const allComponents = [...antdComponents, ...proComponents];
        const list = query
          ? allComponents.filter(c =>
              c.name.toLowerCase().includes(query.toLowerCase()) ||
              c.desc.includes(query)
            )
          : allComponents;

        if (list.length === 0) {
          return `未找到与 "${query}" 匹配的组件。共可查询 ${allComponents.length}+ 个组件。`;
        }

        const bySource = {};
        list.forEach(c => {
          if (!bySource[c.source]) bySource[c.source] = [];
          bySource[c.source].push(c);
        });

        let result = '';
        if (query) result = `匹配 "${query}"：共 ${list.length} 个组件\n\n`;
        for (const [source, comps] of Object.entries(bySource)) {
          result += `【${source}】${comps.length} 个组件：\n`;
          for (const c of comps) result += `- **${c.name}**：${c.desc}\n`;
          result += '\n';
        }
        result += 'pro-components 组件需通过 importPlugin("包名") 异步加载。';
        return result;
      },
    });
  }

  return tools;
}

// ─── ReAct 循环 ─────────────────────────────────────────────────

/**
 * 创建原生 ReAct Agent 实例（无外部依赖）
 *
 * @param {object} config
 * @param {string} config.model       - 模型名称 (如 deepseek-chat, gpt-4o)
 * @param {string} config.secretKey   - API 密钥
 * @param {string} config.baseURL     - API 端点 (如 https://api.deepseek.com/v1)
 * @param {string} [config.systemPrompt] - 系统提示词
 * @param {string} [config.category]  - 工具分类（影响 UI 工具是否启用）
 * @param {Function} [config.getEditor] - 返回最新 editor 实例的函数
 * @returns {{ stream: AsyncGenerator }}
 */
export function createReactAgentInstance(config) {
  const tools = buildEditorTools(config.getEditor, config.category);
  const MAX_STEPS = 6;

  /**
   * ReAct 主循环（AsyncGenerator）
   *
   * @param {object} input            - { messages: [['human', text], ...] }
   * @param {object} [options]
   * @param {AbortSignal} [options.signal]
   *
   * @yields {object} 事件：
   *   { type: 'text', content: string }          — 流式文本 token
   *   { type: 'tool_call', id, name, args }      — 工具调用声明
   *   { type: 'tool_result', id, name, result }  — 工具执行结果
   *   { type: 'done' }                            — 流结束
   */
  async function* agentStream(input, options = {}) {
    const { signal } = options;
    let messages = [];

    // ── 系统消息 ──
    const systemText = config.systemPrompt || '你是一个工具箱智能体。';
    messages.push({ role: 'system', content: systemText });

    // ── 历史消息 ──
    for (const msg of (input.messages || [])) {
      if (Array.isArray(msg) && msg.length >= 2) {
        const [role, content] = msg;
        if (role === 'human') messages.push({ role: 'user', content });
        else if (role === 'ai' || role === 'assistant') messages.push({ role: 'assistant', content });
        else messages.push({ role, content });
      }
    }

    let stepCount = 0;

    while (stepCount < MAX_STEPS) {
      // 调用 LLM（流式）
      let assistantMessage = null;
      let toolCalls = [];

      for await (const evt of streamLLM({ messages, tools, config, signal })) {
        if (evt.type === 'text') {
          yield evt; // 透传文本 token
        } else if (evt.type === 'tool_call') {
          toolCalls.push(evt);
        } else if (evt.type === 'assistant_message') {
          assistantMessage = evt.message;
        }
      }

      if (!assistantMessage) {
        yield { type: 'done' };
        return;
      }

      // 追加 assistant 消息到对话历史
      messages.push(assistantMessage);

      if (toolCalls.length === 0) {
        // 无工具调用 → 最终回复
        yield { type: 'done' };
        return;
      }

      // 执行工具
      for (const tc of toolCalls) {
        yield { type: 'tool_call', id: tc.id, name: tc.name, args: tc.args };

        const tool = tools.find(t => t.name === tc.name);
        let result;
        if (tool) {
          try {
            result = await tool.func(tc.args);
          } catch (e) {
            result = `工具执行出错: ${e.message}`;
          }
        } else {
          result = `错误：未找到工具 "${tc.name}"`;
        }

        yield { type: 'tool_result', id: tc.id, name: tc.name, result: String(result) };

        // 追加 tool 消息到对话历史
        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: String(result),
        });
      }

      stepCount++;
    }

    // 达到最大步数
    yield { type: 'done' };
  }

  return { stream: agentStream };
}

/**
 * 判断错误是否为用户主动取消
 */
export function isCancelError(error) {
  return error?.name === 'AbortError'
    || error?.message?.includes('abort')
    || error?.message?.includes('cancel')
    || error?.message?.includes('interrupt');
}

/**
 * 从 BaseMessage 或任意对象中提取纯文本
 * 兼容新旧格式
 */
export function extractTextContent(item) {
  if (!item) return '';
  // 新格式事件
  if (item.type === 'text' && typeof item.content === 'string') return item.content;
  // 兼容旧格式
  const content = item.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');
  }
  return '';
}
