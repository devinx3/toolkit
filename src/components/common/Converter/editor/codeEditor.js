import React from 'react';
import { Input, Radio, Space, Button, Drawer } from 'antd';

import MonacoEditor from '@monaco-editor/react';
import loadEditor from './loadEditor';

const AiView = ({ aiRender }) => {
    const [enableAI, setEnableAI] = React.useState(false);
    return <>
        <Button size="small" onClick={() => setEnableAI(!enableAI)} type="link">AI</Button>
        <Drawer title="AI" open={enableAI} width={"30vw"}
            onClose={() => setEnableAI(false)} footer={null} >
            {aiRender()}
        </Drawer>
    </>
}

const CodeEditor = ({ path, value, onChange, editorHelpRender, aiRender }) => {
    const [enableMonaco, setEnableMonaco] = React.useState(true);
    const handleChangeEditor = (() => setEnableMonaco(!enableMonaco));
    return (<>
        {editorHelpRender && editorHelpRender()}<br />
        <Space style={{ marginTop: '5px', marginBottom: '13px' }} >
            <Radio.Group
                size="small"
                optionType="button"
                onChange={handleChangeEditor}
                options={[{ label: 'monaco', value: "1" }, { label: 'input', value: "0" }]}
                value={enableMonaco ? "1" : "0"}
            />
            {aiRender ? <AiView aiRender={aiRender} /> : null}
        </Space>
        {enableMonaco ?
            <MonacoEditor height="66vh" language="javascript" theme="vs-dark" path={path} value={value} onChange={onChange} beforeMount={loadEditor} />
            : <Input.TextArea placeholder="请输入脚本" rows={8} value={value} onChange={e => onChange(e.target.value)} />}
    </>)
}

export default CodeEditor;