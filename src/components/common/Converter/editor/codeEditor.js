import React from 'react';
import { Input, Radio, Space, Button, Drawer, FloatButton, Typography } from 'antd';
import { ExpandOutlined } from '@ant-design/icons';
import MonacoEditor from '@monaco-editor/react';
import loadEditor from './loadEditor';
import AiCodeEditor from './ai/CodeEditor';
import { getPrompt } from './ai/prompt';

const AiView = ({ prompt }) => {
    const [enableAI, setEnableAI] = React.useState(false);
    return <>
        <Button size="small" onClick={() => setEnableAI(!enableAI)} type="link">AI</Button>
        <Drawer title="AI" open={enableAI} width={"30vw"}
            onClose={() => setEnableAI(false)} footer={null} >
            <Button href='https://www.deepseek.com/' target='_blank' type='link'>Deepseek</Button>
            <Typography.Text copyable={{ text: prompt }} >提示词</Typography.Text>
        </Drawer>
    </>
}

const CodeEditor = ({ category, path, value, onChange, editorHelpRender, onSaveCode, onRunCode }) => {
    const [enableEditorType, setEnableEditorType] = React.useState("1");
    return (<>
        {editorHelpRender && editorHelpRender()}<br />
        <Space style={{ marginTop: '5px', marginBottom: '13px' }} >
            <Radio.Group
                size="small"
                optionType="button"
                onChange={e => setEnableEditorType(e.target.value)}
                options={[{ label: 'monaco', value: "1" }, { label: 'input', value: "0" }]}
                value={enableEditorType}
            />
            {getPrompt(category) ? <AiView prompt={getPrompt(category)} /> : null}
        </Space>
        {enableEditorType === "1" ?
            <MonacoContainer category={category} path={path} value={value} onChange={onChange} onSaveCode={onSaveCode} onRunCode={onRunCode} beforeMount={loadEditor} />
            : <Input.TextArea placeholder="请输入脚本" rows={8} value={value} onChange={e => onChange(e.target.value)} />}
    </>)
}

const MonacoContainer = ({ category, path, value, onChange, onSaveCode, onRunCode, beforeMount }) => {
    const [enableAi, setEnableAi] = React.useState(false);
    if (!enableAi) {
        return <>
            <FloatButton icon={<ExpandOutlined />} onClick={() => setEnableAi(true)} type="primary">AI</FloatButton>
            <MonacoEditor height="66vh" language="javascript" theme="vs-dark" path={path} value={value} onChange={onChange} beforeMount={loadEditor} />
        </>;
    }
    const handleClose = () => {
        setEnableAi(false);
    }
    return <Drawer
        title={null}
        placement="bottom"
        height={"100%"}
        closeIcon={null}
        onClose={handleClose}
        open={true}
        keyboard={false}
        push={false}
        style={{
            position: 'absolute', // 使用绝对定位
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            padding: 0, // 去除内边距
        }}
        styles={{
            body: {
                padding: 0,
            }
        }} >
        <AiCodeEditor category={category} path={path} value={value} onChange={onChange} onSaveCode={onSaveCode} onRunCode={onRunCode} beforeMount={beforeMount} onExit={handleClose} />
    </Drawer>
}

export default CodeEditor;