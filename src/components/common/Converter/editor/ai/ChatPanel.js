import React from 'react';
import { Alert, Input, Button, Select, Typography, Row, Col, Tooltip, Drawer, Space, Menu, Form, message } from 'antd';
import { SendOutlined, SettingOutlined, LoadingOutlined, CaretRightOutlined, DiffOutlined, PlusOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import Editor, { DiffEditor } from '@monaco-editor/react';
import './ChatPanel.css';
import { createConversation } from './AiAgent';
import { getPrompt } from './prompt'
import DataStore from './dataStore'

const { TextArea } = Input;
const { Text } = Typography;


const defaultModelConfig = {
    baseURL: 'https://api.deepseek.com',
    model: 'deepseek-chat',
    secretKey: 'sk-********************************'
}

const CodeView = ({ codeRange, value, language, originEditor }) => {
    const [diffFlag, setDiffFlag] = React.useState(false);
    const [original, setOriginal] = React.useState('');

    React.useEffect(() => {
        if (originEditor && codeRange) {
            const editorModel = originEditor.getModel();
            const range = originEditor.getSelection();
            setOriginal(editorModel.getValueInRange(range) || '');
        } else {
            setOriginal(originEditor?.getValue() || '');
        }
    }, [diffFlag, codeRange, originEditor]);
    const updateOriginalValue = (val) => {
        if (!originEditor) {
            message.error("编辑器不存在");
            return;
        }
        if (codeRange) {
            originEditor.executeEdits("", [
                {
                    range: codeRange,
                    text: val,
                    forceMoveMarkers: true,
                },
            ]);
        } else {
            originEditor.setValue(val)
        }
    }
    return (<>
        <div style={{ backgroundColor: '#222222', padding: '10px', borderRadius: '4px' }}>
            <Row gutter={16}>
                <Col flex={2}>
                    脚本
                </Col>
                <Col flex="right">
                    <Text copyable={{ text: value }} />
                    <Space />
                    <Tooltip placement="topRight" title="应用">
                        <Button
                            style={{ backgroundColor: 'transparent', borderColor: 'transparent' }}
                            icon={<CaretRightOutlined style={{ color: 'white' }} />}
                            size='small'
                            onClick={() => updateOriginalValue(value)}
                        />
                    </Tooltip>
                    <Space />
                    <Tooltip placement="topRight" title="对比">
                        <Button
                            style={{ backgroundColor: 'transparent', borderColor: 'transparent' }}
                            icon={<DiffOutlined style={{ color: 'white' }} />}
                            size='small'
                            onClick={() => setDiffFlag(true)}
                        />
                    </Tooltip>
                </Col>
            </Row>
            <Row>
                <Editor
                    language={language}
                    value={value}
                    theme='vs-dark'
                    options={{
                        readOnly: true,
                        lineNumbers: false,
                        scrollbar: {
                            vertical: 'hidden',
                            horizontal: 'hidden',
                            handleMouseWheel: false,
                        },
                        folding: false,
                        minimap: { enabled: false },
                        wordWrap: "off",
                        renderWhitespace: 'none',
                        scrollBeyondLastLine: false,
                        renderLineHighlight: false,
                        suggestOnTriggerCharacters: false,
                        quickSuggestions: false,
                        contextmenu: false,
                        overviewRulerLanes: 0,
                        hideCursorInOverviewRuler: true,
                        overviewRulerBorder: false,
                    }}
                    onMount={editor => {
                        editor.layout({ height: editor.getContentHeight() })
                    }}
                />
            </Row>
        </div>
        <CodeDiffEditorView
            updateOriginalValue={updateOriginalValue}
            openCodeDiffView={diffFlag}
            closeCodeDiffView={() => setDiffFlag(false)}
            language={language}
            original={original}
            modified={value}
            originEditor={originEditor}
        />
    </>);
};
const CodeDiffEditorView = ({ openCodeDiffView, closeCodeDiffView, language, original, modified, updateOriginalValue }) => {
    return (
        <Drawer
            height="80vh"
            width="70vw"
            title="内容对比"
            placement="left"
            open={openCodeDiffView}
            onClose={closeCodeDiffView}
            extra={<Button type='primary' onClick={() => updateOriginalValue(modified) & closeCodeDiffView()}>应用</Button>}
        >
            <DiffEditor
                language={language}
                original={original}
                modified={modified}
                theme="vs-dark"
                options={{
                    scrollbar: {
                        vertical: 'hidden',
                        horizontal: 'hidden',
                    },
                    folding: false,
                    minimap: { enabled: false },
                    wordWrap: "off",
                    renderWhitespace: 'none',
                    scrollBeyondLastLine: false,
                    renderLineHighlight: false,
                    suggestOnTriggerCharacters: false,
                    quickSuggestions: false,
                    contextmenu: false,
                    overviewRulerLanes: 0,
                    hideCursorInOverviewRuler: true,
                    overviewRulerBorder: false,
                    renderOverviewRuler: false,
                    hideUnchangedRegions: {
                        enabled: true
                    },
                }}
            />
        </Drawer>
    );
};

const dataStore = new DataStore();

const ModelSetting = ({ usedModelKey, setModelOptions }) => {
    const [open, setOpen] = React.useState(false);
    const [models, setModels] = React.useState([]);
    const [modelKey, setModelKey] = React.useState('');

    const refreshModels = React.useCallback(() => {
        let list = dataStore.listModel();
        setModels(list);
        setModelOptions(list.map(x => x.model));
    }, [setModelOptions]);

    React.useEffect(() => {
        refreshModels();
    }, [refreshModels]);

    const handleAddItem = () => {
        setModelKey('');
    };

    const handleMenuClick = (event) => {
        setModelKey(event.key);
    };

    return (<>
        <Button className="model-setting-btn" onClick={() => setOpen(true)}>
            <SettingOutlined />
        </Button>
        {open ?
            <Drawer
                height="80vh"
                width="60vw"
                title="模型配置"
                open={true}
                onClose={() => setOpen(false)} >
                <Button type="primary" onClick={handleAddItem} style={{ marginBottom: '10px' }}>
                    添加
                </Button>
                <Row>
                    <Col span={6}>
                        <Menu
                            onClick={e => handleMenuClick(e)}
                            mode="inline"
                            selectedKeys={[modelKey]}
                            style={{ height: '100%', borderRight: 0 }}
                            items={models.map((model) => (
                                {
                                    key: model.model,
                                    label: model.model,
                                }
                            ))}
                        />
                    </Col>
                    <Col span={16}>
                        <ModelSettingForm usedModelKey={usedModelKey} updateKey={key => setModelKey(key) & refreshModels()} model={modelKey} data={dataStore.getModel(modelKey) || {}} />
                    </Col>
                </Row>
            </Drawer> : null}
    </>);
}

const ModelSettingForm = ({ usedModelKey, updateKey, model, data }) => {
    const [form] = Form.useForm();

    React.useEffect(() => {
        form.setFieldsValue({
            model: model,
            secretKey: '',
            baseURL: data.baseURL
        });
    }, [model, data, form]);

    const handleSave = async () => {
        try {
            // Validate the form fields
            const values = await form.validateFields();
            try {
                if (model) {
                    dataStore.updateModel(values);
                } else {
                    dataStore.createModel(values);
                }
                message.success('保存成功');
                updateKey(values.model);
            } catch (e) {
                message.error(`保存失败: ${e.message}`);
            }
        } catch (errorInfo) {
            console.log('Validation Failed:', errorInfo);
        }
    };

    const handleDelete = () => {
        dataStore.deleteModel(model);
        updateKey('');
    };

    return (
        <Form form={form} layout="horizontal">
            <Form.Item
                label="模型"
                name="model"
                labelCol={{ span: 6 }}
                rules={[{ required: true, message: '请输入模型' }]}
            >
                <Input placeholder={defaultModelConfig.model} disabled={!!model} />
            </Form.Item>
            <Form.Item
                label="密钥"
                name="secretKey"
                labelCol={{ span: 6 }}
                rules={[{ required: !model, message: '请输入密钥' }]}
            >
                <Input placeholder={defaultModelConfig.secretKey} />
            </Form.Item>
            <Form.Item
                label="baseURL"
                name="baseURL"
                labelCol={{ span: 6 }}
                rules={[{ required: true, message: '请输入baseURL' }]}
            >
                <Input placeholder={defaultModelConfig.baseURL} />
            </Form.Item>
            <Row justify="end" style={{ marginTop: '20px' }}>
                <Col>
                    <Button type="primary" onClick={handleSave} style={{ marginRight: '10px' }}>
                        保存
                    </Button>
                    {!!model && model !== usedModelKey ? <Button type="default" onClick={handleDelete}>删除</Button> : null}
                </Col>
            </Row>
        </Form>
    );
}

const chatCache = {
    path: undefined,
    defaultData: {
        messages: [],
        conversation: null,
        inputMessage: '',
        errorMessage: '',
        codeSelect: 'code'
    },
    data: null
}

const updateChatData = (path, data) => {
    chatCache.path = path;
    chatCache.data = data;
}
const getChatData = (path) => {
    if (path != chatCache.path) {
        return chatCache.defaultData;
    }
    return chatCache.data || chatCache.defaultData;
}

const ChatPanel = ({ path, category, monaco, editor }) => {
    const chatCacheData = getChatData(path);
    const [messages, setMessages] = React.useState(chatCacheData.messages);
    const [inputMessage, setInputMessage] = React.useState(chatCacheData.inputMessage);
    const [favoriteModel, setFavoriteModel] = React.useState(dataStore.getFavoriteModel());
    const [modelOptions, setModelOptions] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState(chatCacheData.errorMessage);
    const messagesEndRef = React.useRef(null);
    const [conversation, setConversation] = React.useState(chatCacheData.conversation);
    const [codeSelect, setCodeSelect] = React.useState(chatCacheData.codeSelect);

    React.useEffect(() => {
        updateChatData(path, { messages, inputMessage, errorMessage, conversation, codeSelect })
    }, [messages, inputMessage, errorMessage, conversation, codeSelect]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const startChat = (val) => {
        setMessages([]);
        setErrorMessage('');
        setConversation(null);
        handleUpdateModelChat(val);
    }

    const handleUpdateModelChat = (model) => {
        const modelConfig = dataStore.getModel(model, true);
        if (!model) {
            message.warning("模型不存在, 请检查");
            return;
        }
        // 会话
        setConversation(createConversation({
            baseURL: modelConfig.baseURL || defaultModelConfig.baseURL,
            model: modelConfig.model || defaultModelConfig.model,
            secretKey: modelConfig.secretKey || defaultModelConfig.secretKey,
        }));
    }

    React.useEffect(() => {
        if (!conversation && favoriteModel) {
            handleUpdateModelChat(favoriteModel);
        }
    }, [favoriteModel, conversation]);

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);


    const handleChat = async (inputMessage) => {
        try {
            if (conversation.isEmpty()) {
                const systemPrompt = getPrompt(category);
                if (systemPrompt) {
                    conversation.system(systemPrompt);
                }
            }
            let range = null;
            if (codeSelect && editor) {
                let currentCode;
                if (codeSelect === 'selection') {
                    const editorModel = editor.getModel();
                    range = editor.getSelection();
                    debugger
                    currentCode = editorModel.getValueInRange(range);
                } else {
                    currentCode = editor.getValue();
                }
                if (currentCode) {
                    conversation.user("最新代码:\n```\n" + currentCode + "\n```");
                }
            }
            conversation.user(inputMessage);
            const res = await conversation.chat({ range });
            return { ...res, range };
        } catch (error) {
            throw new Error('API 请求失败: ' + error.message);
        }
    };

    const handleSendMessage = () => {
        if (loading) return;
        if (inputMessage.trim().length === 0) return;
        if (!favoriteModel) {
            if (!(modelOptions.length > 0)) {
                message.warning("请配置模型");
            } else {
                message.warning("请选择模型");
            }
            return;
        }
        const callback = async () => {
            try {
                // 添加用户消息
                setMessages(prev => [...prev, {
                    text: inputMessage,
                    sender: 'user',
                    time: new Date()
                }]);

                // 调用 API
                const { range, content } = await handleChat(inputMessage);

                // 添加 AI 响应
                setMessages(prev => [...prev, {
                    text: content,
                    sender: 'ai',
                    codeRange: range,
                    time: new Date()
                }]);
            } catch (error) {
                console.error('请求数据失败:', error);
                setErrorMessage('抱歉，发生了错误，请稍后重试。');
            }
        }
        setErrorMessage('');
        setInputMessage('');
        setLoading(true);
        callback().finally(() => setLoading(false));
    };
    return (
        <div className="devinx3-chat">
            <div className="devinx3-chat-header">
                <Text>AI 助手</Text>
                <Button style={{ color: 'white' }} size='small' icon={<PlusOutlined />} disabled={loading} onClick={() => startChat(favoriteModel)} />
            </div>

            <div className="devinx3-chat-message-list">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`devinx3-chat-message ${msg.sender === 'user' ? 'user' : 'ai'}`}
                    >
                        {msg.sender === 'user' ? (
                            <div>{msg.text}</div>
                        ) : (
                            <div>
                                <ReactMarkdown
                                    components={{
                                        code: ({ node, inline, className, children, ...props }) => {
                                            const language = className ? className.replace('language-', '') : '';
                                            const value = String(children).trimEnd("\n");
                                            return value.includes('\n') ? (
                                                <CodeView codeRange={msg.codeRange} language={language} value={value} originEditor={editor} />
                                            ) : (
                                                <code {...props}>{children}</code>
                                            );
                                        }
                                    }}
                                >
                                    {msg.text}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                ))}
                {loading ? <Button style={{ backgroundColor: 'transparent', borderColor: 'transparent' }} icon={<LoadingOutlined style={{ color: 'white' }} />} /> : null}
                {errorMessage ? <Alert type="error" style={{ fontSize: "12px" }} message={errorMessage} /> : null}

                <div ref={messagesEndRef} />
            </div>
            <div className="devinx3-chat-input-area">
                <TextArea
                    style={{ fontSize: "12px" }}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    placeholder="输入问题..."
                    autoSize={{ minRows: 3, maxRows: 6 }}
                    disabled={loading}
                />
                <Row className="devinx3-chat-toolbar" align="middle" justify="space-between">
                    <Col>
                        <Row gutter={8} align="middle">
                            <Col>
                                <ModelSetting usedModelKey={favoriteModel} setModelOptions={setModelOptions} />
                                <Select
                                    className="model-select"
                                    value={favoriteModel}
                                    onChange={(val) => {
                                        setFavoriteModel(val);
                                        dataStore.updateFavoriteModel(val);
                                        startChat(val);
                                    }}
                                    placement="topLeft"
                                    options={
                                        modelOptions.map(x => ({
                                            value: x,
                                            label: x
                                        }))
                                    }
                                    disabled={loading}
                                />
                            </Col>
                            <Col>

                                <Select
                                    className="code-select"
                                    value={codeSelect}
                                    onChange={setCodeSelect}
                                    placement="topLeft"
                                    options={[
                                        { value: 'code', label: '全文' },
                                        { value: 'selection', label: '选中区' }
                                    ]}
                                    allowClear
                                    disabled={loading}
                                />
                            </Col>
                        </Row>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={handleSendMessage}
                            loading={loading}
                        >
                            发送
                        </Button>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default ChatPanel; 