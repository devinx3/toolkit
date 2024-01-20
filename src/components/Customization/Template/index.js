import React from 'react';
import { Divider, Typography, Alert, Col, Row } from 'antd';
import Converter from '../../common/Converter';
import { ScriptResult } from '../../common/Converter/adaptor/index';
import { LANG } from '../../common/Converter/constants';
import StrUtil from '../../../utils/StrUtil'
import CodeHelpView from './codeHelp';

const { Title } = Typography;

// 解析输出元素
const convertOuput = (outputData) => {
    let outputEle = outputData instanceof ScriptResult ? outputData.get() : outputData;
    if (!React.isValidElement(outputEle) && !(outputEle instanceof Function)) outputEle = undefined;
    return outputEle;
}

// 数据块渲染
const DataBlockRender = ({ state }) => {
    const { outputData, errorMsg } = state;
    const OutputEle = StrUtil.isBlank(errorMsg) ? convertOuput(outputData) : [];
    let alertMessage = StrUtil.isBlank(errorMsg) && !OutputEle ? "" : errorMsg;
    if (outputData && !StrUtil.isBlank(alertMessage)) alertMessage = "无渲染组件";
    return <div style={{ margin: '15px' }}>
        {StrUtil.isBlank(alertMessage) ?
            (OutputEle instanceof Function ? <OutputEle /> : (OutputEle ? OutputEle : null)) :
            <Row><Col span={8}><Alert message={alertMessage} type="error" /></Col></Row>}
    </div>
}

// 模板页面
const TemplatePage = ({ category, name }) => {
    return <>
        <Title level={3}>{name}</Title>
        <Divider />
        <Converter
            category={`customize-${category}`}
            lang={LANG.JSX}
            manage={{
                // 基本按钮
                buttons: [],
                expandScriptButton: {
                    name: "自定义",
                    description: "支持自定义页面",
                    scriptContent: "return <div>Hello, World!</div>;"
                },
                // 编辑器帮助文档
                editorHelpRender: CodeHelpView
            }}
            // 数据区
            dataBlockRender={DataBlockRender}
        />
    </>
}

export default TemplatePage;