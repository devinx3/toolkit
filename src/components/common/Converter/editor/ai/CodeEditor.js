import React, { useState } from 'react';
import { Divider, Menu, Typography } from "antd";
import Editor from '@monaco-editor/react';
import ChatPanel from './ChatPanel';
import './CodeEditor.css';

const { Text } = Typography;

const AiCodeEditor = ({ category, path, value, onChange, onExit, beforeMount }) => {
    const [monacoInstance, setMonacoInstance] = useState(null);
    const [editorInstance, setEditorInstance] = useState(null);
    const containerRef = React.useRef(null);

    const handleEditorDidMount = (editor, monaco) => {
        setEditorInstance(editor);
        setMonacoInstance(monaco);
        if (editor && monaco) {
            editor.addCommand(monaco.KeyCode.Escape, onExit);
        }
    };

    return (
        <div className="devinx3-editor-container">
            <div className='devinx3-editor-header'>
                <Menu
                    className='devinx3-editor-header-menu'
                    mode="horizontal"
                    items={[{
                        key: 'file',
                        label: <Text className='devinx3-label'>File</Text>,
                        children: [{
                            key: 'exit',
                            label: 'Exit',
                            onClick: () => onExit()
                        }]
                    }]}
                />
            </div>
            <Divider style={{ height: '1px', margin: '3px' }} />
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <div ref={containerRef} className="devinx3-editor-content" style={{ flex: 1 }}>
                    <Editor
                        language="javascript"
                        theme="vs-dark"
                        path={path}
                        value={value}
                        onChange={onChange}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            roundedSelection: false,
                            padding: { top: 5, bottom: 5 },
                            automaticLayout: true
                        }}
                        beforeMount={beforeMount}
                        onMount={handleEditorDidMount}
                    />
                </div>
                <EditorSider
                    category={category}
                    containerWidth={containerRef.current?.offsetWidth || 0}
                    monacoInstance={monacoInstance}
                    editorInstance={editorInstance}
                />
            </div>
        </div>
    );
};

const minEditorWidthRatio = 0.3; // 编辑器最小宽度 30%
const maxEditorWidthRatio = 0.7; // 编辑器最大宽度 70%
const EditorSider = ({ category, monacoInstance, editorInstance }) => {
    const containerWidth = document.body.offsetWidth;
    const [width, setWidth] = useState(document.body.offsetWidth * minEditorWidthRatio); // 初始化侧边栏宽度
    const handleMouseDown = (e) => {
        if (containerWidth <= 0) {
            return;
        }
        e.preventDefault();
        const minEditorWidth = containerWidth * minEditorWidthRatio;
        const maxEditorWidth = containerWidth * maxEditorWidthRatio;
        const handleMouseMove = (e) => {
            // 计算编辑器的新宽度
            let editorWidth = e.clientX;

            // 确保编辑器宽度在允许范围内
            if (editorWidth < minEditorWidth) {
                editorWidth = minEditorWidth;
            } else if (editorWidth > maxEditorWidth) {
                editorWidth = maxEditorWidth;
            }

            // 计算侧边栏宽度 = 总宽度 - 编辑器宽度 - 分隔条宽度
            const newSidebarWidth = containerWidth - editorWidth - 2;
            setWidth(newSidebarWidth);

            // 更新编辑器布局
            const editorContainer = editorInstance?.getContainerDomNode();
            if (editorInstance && editorContainer) {
                editorInstance.layout({
                    width: editorWidth,
                    height: editorContainer.offsetHeight
                });
            }
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <>
            <div
                className="resizer"
                onMouseDown={handleMouseDown}
                style={{ cursor: 'ew-resize', width: '2px', backgroundColor: 'transparent' }}
            />
            <div className="devinx3-editor-sider" style={{ width: width }}>
                <ChatPanel
                    category={category}
                    monaco={monacoInstance}
                    editor={editorInstance}
                />
            </div>
        </>
    );
};

export default AiCodeEditor;