import React from 'react';
import { Input } from 'antd';

const CodeEditor = ({ lang, value, onChange, editorHelpRender }) => {
    return (<>
        {editorHelpRender && editorHelpRender()}
        <Input.TextArea style={{ marginTop: '13px' }} placeholder="请输入脚本" rows={8} value={value} onChange={e => onChange(e.target.value)} />
    </>)
}

export default CodeEditor;