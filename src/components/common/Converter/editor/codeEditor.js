import React from 'react';
import { Input, Radio, Space } from 'antd';
import MonacoEditor from '@monaco-editor/react';
import loadEditor from './loadEditor';

const CodeEditor = ({ path, value, onChange, editorHelpRender }) => {
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
        </Space>
        {enableMonaco ?
            <MonacoEditor height="66vh" language="javascript" theme="vs-dark" path={path} value={value} onChange={onChange} beforeMount={loadEditor} />
            : <Input.TextArea placeholder="请输入脚本" rows={8} value={value} onChange={e => onChange(e.target.value)} />}
    </>)
}

export default CodeEditor;