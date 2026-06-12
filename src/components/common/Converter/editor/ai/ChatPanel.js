import React from 'react';
import { Alert, Input, Button, Select, Typography, Row, Col, Drawer, Menu, Form, message, ConfigProvider, theme, Collapse, Space, Tag } from 'antd';
import { SendOutlined, SettingOutlined, LoadingOutlined, PlusOutlined, StopOutlined, CopyOutlined, CheckOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ChatPanel.css';
import { createReactAgentInstance, isCancelError } from './AiAgent';
import { getPrompt } from './prompt';
import DataStore from './dataStore';

const { TextArea } = Input;
const { Text } = Typography;

const defaultModelConfig = {
  baseURL: 'https://api.deepseek.com',
  model: 'deepseek-chat',
  secretKey: 'sk-********************************'
};

// ─── Markdown 渲染 ────────────────────────────────────────────

/** 代码块：主题色 <pre><code> + 复制按钮 */
const CodeBlock = ({ language, value }) => {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <div className='devinx3-md-code-block'>
      <div className='devinx3-md-code-header'>
        <span className='devinx3-md-code-lang'>{language || 'code'}</span>
        <Button type='text' size='small' className='devinx3-md-copy-btn'
          icon={copied ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
          onClick={handleCopy}>
          {copied ? '已复制' : '复制'}
        </Button>
      </div>
      <pre className='devinx3-md-code-pre'><code>{value}</code></pre>
    </div>
  );
};

/** Markdown 内容渲染器 */
const ReactMarkdownView = React.memo(({ content }) => {
  const components = React.useMemo(() => ({
    code({ node, inline, className, children, ...props }) {
      const value = String(children).trimEnd('\n');
      if (inline || !value.includes('\n')) {
        return <code className='devinx3-md-inline-code' {...props}>{children}</code>;
      }
      const language = className ? className.replace('language-', '') : '';
      return <CodeBlock language={language} value={value} />;
    },
    table({ children, ...props }) {
      return <div className='devinx3-md-table-wrapper'><table className='devinx3-md-table' {...props}>{children}</table></div>;
    },
    th({ children, ...props }) {
      return <th className='devinx3-md-th' {...props}>{children}</th>;
    },
    td({ children, ...props }) {
      return <td className='devinx3-md-td' {...props}>{children}</td>;
    },
  }), []);
  if (!content) return null;
  return (
    <div className='devinx3-md-content'>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >{content}</ReactMarkdown>
    </div>
  );
});

/** 工具调用+结果合并折叠块，默认折叠，只显示响应 */
const ToolStep = ({ step }) => {
  const isRunning = step.status === 'running';
  const header = (
    <Space size={6}>
      <span style={{ fontSize: 13 }}>{isRunning ? '⏳' : '🔧'}</span>
      <Text strong style={{ fontSize: 12, color: '#e0e0e0' }}>{step.name}</Text>
      {isRunning && <Tag color='orange' style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px' }}>执行中...</Tag>}
    </Space>
  );
  return (
    <Collapse
      ghost
      bordered={false}
      style={{ background: 'transparent', marginBottom: 0 }}
      items={[{
        key: step.name,
        label: header,
        children: step.result && (
          <div style={{ background: '#1a1a1a', borderRadius: 4, padding: '8px 12px', marginTop: 0 }}>
            <pre style={{
              margin: 0, fontSize: 11, fontFamily: "'Consolas','Courier New',monospace",
              color: '#d4d4d4', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
            }}>{step.result}</pre>
          </div>
        ),
      }]}
    />
  );
};

/** Agent 步骤渲染：正在执行时显示全部步骤，完成后只保留最终思考文本 */
const AgentStepView = React.memo(({ steps, streaming }) => {
  if (!steps || steps.length === 0) return null;
  // 完成后只显示 text 步骤（最终合成回复）
  const visibleSteps = streaming ? steps : steps.filter(s => s.type === 'text');
  if (visibleSteps.length === 0) return null;
  return (
    <div className='devinx3-agent-steps'>
      {visibleSteps.map((step, i) => {
        if (step.type === 'text') {
          return <div key={i} style={step.style || {}}><ReactMarkdownView content={step.content} /></div>;
        }
        if (step.type === 'tool') {
          return <ToolStep key={i} step={step} />;
        }
        return null;
      })}
    </div>
  );
});

const dataStore = new DataStore();

// ─── 模型设置 Drawer ──────────────────────────────────────────

const ModelSetting = ({ usedModelKey, setModelOptions }) => {
  const [open, setOpen] = React.useState(false);
  const [models, setModels] = React.useState([]);
  const [modelKey, setModelKey] = React.useState('');

  const refreshModels = React.useCallback(() => {
    const list = dataStore.listModel();
    setModels(list);
    setModelOptions(list.map(x => x.model));
  }, [setModelOptions]);

  React.useEffect(() => { refreshModels(); }, [refreshModels]);

  return (<>
    <Button onClick={() => setOpen(true)}><SettingOutlined /></Button>
    {open && (
      <Drawer height='80vh' width='60vw' title='模型配置' open onClose={() => setOpen(false)}>
        <Button type='primary' onClick={() => setModelKey('')} style={{ marginBottom: 10 }}>添加</Button>
        <Row>
          <Col span={6}>
            <Menu onClick={e => setModelKey(e.key)} mode='inline' selectedKeys={[modelKey]}
              items={models.map(m => ({ key: m.model, label: m.model }))} />
          </Col>
          <Col span={16}>
            <ModelSettingForm usedModelKey={usedModelKey}
              updateKey={key => { setModelKey(key); refreshModels(); }}
              model={modelKey} data={dataStore.getModel(modelKey) || {}} />
          </Col>
        </Row>
      </Drawer>
    )}
  </>);
};

// ─── 模型配置表单 ──────────────────────────────────────────────

const ModelSettingForm = ({ usedModelKey, updateKey, model, data }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    form.setFieldsValue({ model, secretKey: '', baseURL: data.baseURL });
  }, [model, data, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      try {
        if (model) dataStore.updateModel(values);
        else dataStore.createModel(values);
        message.success('保存成功');
        updateKey(values.model);
      } catch (e) {
        message.error(`保存失败: ${e.message}`);
      }
    } catch (e) { /* validation fail */ }
  };

  return (
    <Form form={form} layout='horizontal'>
      <Form.Item label='模型' name='model' labelCol={{ span: 6 }}
        rules={[{ required: true, message: '请输入模型' }]}>
        <Input placeholder={defaultModelConfig.model} disabled={!!model} />
      </Form.Item>
      <Form.Item label='密钥' name='secretKey' labelCol={{ span: 6 }}
        rules={[{ required: !model, message: '请输入密钥' }]}>
        <Input placeholder={defaultModelConfig.secretKey} />
      </Form.Item>
      <Form.Item label='baseURL' name='baseURL' labelCol={{ span: 6 }}
        rules={[{ required: true, message: '请输入baseURL' }]}>
        <Input placeholder={defaultModelConfig.baseURL} />
      </Form.Item>
      <Row justify='end' style={{ marginTop: 20 }}>
        <Col>
          <Button type='primary' onClick={handleSave} style={{ marginRight: 10 }}>保存</Button>
          {!!model && model !== usedModelKey &&
            <Button type='default' onClick={() => { dataStore.deleteModel(model); updateKey(''); }}>删除</Button>}
        </Col>
      </Row>
    </Form>
  );
};

// ─── 会话缓存 ──────────────────────────────────────────────────

const chatCache = {
  path: undefined,
  defaultData: { messages: [], inputMessage: '', errorMessage: '' },
  data: null,
};
const updateChatData = (path, data) => { chatCache.path = path; chatCache.data = data; };
const getChatData = (path) => (path !== chatCache.path ? chatCache.defaultData : (chatCache.data || chatCache.defaultData));

// ─── Agent 面板 ────────────────────────────────────────────────

const AgentPanel = ({ path, category, monaco, editor }) => {
  const cacheData = getChatData(path);
  const [messages, setMessages] = React.useState(cacheData.messages);
  const [inputMessage, setInputMessage] = React.useState(cacheData.inputMessage);
  const [favoriteModel, setFavoriteModel] = React.useState(dataStore.getFavoriteModel());
  const [modelOptions, setModelOptions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(cacheData.errorMessage);
  const messagesEndRef = React.useRef(null);
  const agentRef = React.useRef(null);
  const abortRef = React.useRef(null);

  // editor 使用 ref 实时同步，确保工具始终读取最新实例
  const editorRef = React.useRef(editor);
  editorRef.current = editor;

  // 持久化会话数据
  React.useEffect(() => {
    updateChatData(path, { messages, inputMessage, errorMessage });
  }, [path, messages, inputMessage, errorMessage]);

  // 自动滚动
  React.useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [messages]);

  // 初始化 / 重建 agent
  const initAgent = React.useCallback((model) => {
    const modelConfig = dataStore.getModel(model, true);
    if (!modelConfig) { message.warning('模型不存在，请检查配置'); return null; }
    try {
      return createReactAgentInstance({
        model: modelConfig.model || defaultModelConfig.model,
        secretKey: modelConfig.secretKey || defaultModelConfig.secretKey,
        baseURL: modelConfig.baseURL || defaultModelConfig.baseURL,
        systemPrompt: getPrompt(category),
        category,
        // 传 getter 而非直接传 editor，工具执行时通过 ref 拿到最新的 editor
        getEditor: () => editorRef.current,
      });
    } catch (e) { message.error(`Agent 初始化失败: ${e.message}`); return null; }
  }, [category]);

  React.useEffect(() => {
    if (favoriteModel && !agentRef.current) {
      agentRef.current = initAgent(favoriteModel);
    }
  }, [favoriteModel, initAgent]);

  // 新建对话
  const startChat = (val) => {
    setMessages([]);
    setErrorMessage('');
    if (val) agentRef.current = initAgent(val);
  };

  // 取消
  const handleCancelMessage = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    // 清除工具步骤，关闭闪烁光标，追加停止提示
    setMessages(prev => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last && last.sender === 'ai') {
        const textSteps = last.steps ? last.steps.filter(s => s.type === 'text') : [];
        const stopStep = { type: 'text', content: '---\n\n已停止', style: { color: '#666', fontSize: '11px' } };
        updated[updated.length - 1] = {
          ...last,
          steps: [...textSteps, stopStep],
          streaming: false,
        };
      }
      return updated;
    });
    setLoading(false);
    setErrorMessage('');
  };

  // 发送消息 → 调用 ReAct Agent（streaming）
  const handleSendMessage = async () => {
    if (loading || !inputMessage.trim()) return;
    if (!favoriteModel) {
      message.warning(modelOptions.length > 0 ? '请选择模型' : '请配置模型');
      return;
    }

    const userText = inputMessage.trim();
    setInputMessage('');
    setErrorMessage('');
    setLoading(true);

    // 用户消息
    setMessages(prev => [...prev, { text: userText, sender: 'user', time: new Date() }]);

    // AI 占位
    const aiMsgId = 'ai-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    setMessages(prev => [...prev, { id: aiMsgId, text: '', sender: 'ai', time: new Date(), streaming: true }]);

    try {
      const agent = agentRef.current;
      if (!agent) throw new Error('Agent 未初始化，请检查模型配置');

      // 仅发送用户原文，Agent 通过 readCode / findCode 等工具自行读取代码
      const userMessageText = userText;

      // 流式调用原生 ReAct Agent
      const abortController = new AbortController();
      abortRef.current = abortController;
      const stream = agent.stream(
        { messages: [['human', userMessageText]] },
        { signal: abortController.signal }
      );

      let steps = [];
      let currentThought = '';
      let aborted = false;

      const flushThought = () => {
        const trimmed = currentThought.trim();
        if (trimmed) {
          steps.push({ type: 'text', content: trimmed });
        }
        currentThought = '';
      };
      const updateUI = () => {
        const stepsSnapshot = [...steps];
        // 如果有未刷新的思考文本，追加到最后
        if (currentThought.trim()) {
          stepsSnapshot.push({ type: 'text', content: currentThought.trim() });
        }
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.id === aiMsgId) {
            updated[updated.length - 1] = { ...last, steps: stepsSnapshot };
          }
          return updated;
        });
      };

      for await (const event of stream) {
        if (!event) continue;
        // 如果已被取消，停止处理
        if (abortController.signal.aborted) {
          aborted = true;
          break;
        }

        switch (event.type) {
          case 'text': {
            // 流式文本 token → 累加到 currentThought
            currentThought += event.content;
            updateUI();
            break;
          }
          case 'tool_call': {
            // 工具调用声明 — 刷新当前思考，添加 running 步骤
            flushThought();
            steps.push({
              type: 'tool',
              id: event.id,
              name: event.name,
              input: event.args,
              result: null,
              status: 'running',
            });
            updateUI();
            break;
          }
          case 'tool_result': {
            // 工具执行结果 — 匹配到对应的 running 步骤，标记 done
            const matchIdx = steps.findIndex(
              s => s.type === 'tool' && s.status === 'running' && s.id === event.id
            );
            if (matchIdx >= 0) {
              steps[matchIdx] = {
                ...steps[matchIdx],
                result: event.result,
                status: 'done',
              };
            } else {
              steps.push({
                type: 'tool',
                id: event.id,
                name: event.name,
                result: event.result,
                status: 'done',
              });
            }
            updateUI();
            break;
          }
          case 'done': {
            // 流结束
            break;
          }
          default: {
            break;
          }
        }
      }

      // 刷新最后一段思考
      flushThought();

      // 最终态（取消时不更新，避免覆盖已停止状态）
      if (!aborted) {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.id === aiMsgId) {
            updated[updated.length - 1] = { ...last, steps: [...steps], streaming: false };
          }
          return updated;
        });
      }
    } catch (error) {
      if (isCancelError(error)) {
        setErrorMessage('');
      } else {
        console.error('Agent 请求失败:', error);
        setErrorMessage(error.message || '请求失败');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────
  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <div className='devinx3-chat'>
        <div className='devinx3-chat-header'>
          <Text>工具箱智能体</Text>
          <Button type='link' style={{ color: 'white' }} size='small'
            icon={<PlusOutlined />} disabled={loading}
            onClick={() => startChat(favoriteModel)} />
        </div>

        <div className='devinx3-chat-message-list'>
          {messages.map((msg, index) => (
            <div key={msg.id || index}
              className={`devinx3-chat-message ${msg.sender === 'user' ? 'user' : 'ai'}${msg.streaming ? ' streaming' : ''}`}>
              {msg.sender === 'user' ? (
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
              ) : (
                <div>
                  <AgentStepView steps={msg.steps} streaming={msg.streaming} />
                  {msg.streaming && (
                    <span className='streaming-cursor' style={{
                      display: 'inline-block', width: 2, height: 14,
                      backgroundColor: '#d4d4d4', marginLeft: 2,
                      animation: 'blink 1s step-end infinite', verticalAlign: 'middle',
                    }} />
                  )}
                </div>
              )}
            </div>
          ))}
          {loading && !messages.some(m => m.streaming) &&
            <div className='devinx3-chat-message ai'><LoadingOutlined style={{ color: '#888' }} /></div>}
          {errorMessage && (
            <Alert type='error' style={{ fontSize: 12 }} message={errorMessage}
              closable onClose={() => setErrorMessage('')} />)}
          <div ref={messagesEndRef} />
        </div>

        <div>
          <TextArea style={{ fontSize: 12, background: '#2d2d2d', color: '#d4d4d4', borderColor: '#444' }}
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
            placeholder='输入问题，Agent 将推理并回答...'
            autoSize={{ minRows: 6, maxRows: 30 }} />
          <Row style={{ marginTop: 5, marginBottom: 5 }} align='middle' justify='space-between'>
            <Col>
              <Row gutter={8} align='middle'>
                <Col>
                  <ModelSetting usedModelKey={favoriteModel} setModelOptions={setModelOptions} />
                  <Select value={favoriteModel}
                    onChange={val => { setFavoriteModel(val); dataStore.updateFavoriteModel(val); startChat(val); }}
                    placement='topLeft'
                    options={modelOptions.map(x => ({ value: x, label: x }))}
                    disabled={loading} />
                </Col>
              </Row>
            </Col>
            <Col>
              {loading ? (
                <Button icon={<StopOutlined />} onClick={handleCancelMessage} title='停止' type='text' size='small' />
              ) : (
                <Button icon={<SendOutlined />} onClick={handleSendMessage} title='发送' />
              )}
            </Col>
          </Row>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default AgentPanel;
