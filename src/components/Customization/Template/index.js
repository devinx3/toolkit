import React from 'react';
import { Typography, Alert, Col, Row, Tabs } from 'antd';
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

const needUpdate = (items1, items2) => {
    const flag = items1.length !== items2.length;
    if (flag) {
        return true;
    }
    for (let idx = 0; idx < items1.length; idx++) {
        const item1 = items1[idx];
        const item2 = items2[idx];
        if (item1.key !== item2.key) return true;
        if (item1.label !== item2.label) return true;
        if (item1.children !== item2.children) return true;
    }    
    return false;
}

// 选项卡
const TabPanel = ({items }) => {
    const [currentItems, setCurrentItems] = React.useState(() => [...items]);
    const [currentKey, setCurrentKey] = React.useState();
    if (needUpdate(currentItems, items)) {
        setCurrentItems([...items])
        setCurrentKey(items[items.length - 1].key)
    }
    const handleRemove = (k) => {
        for (let idx = 0; idx < items.length; idx++) {
            const item = items[idx];
            if (item.key === k) {
                items.splice(idx, 1)
                break;
            }
        }
        setCurrentItems([])
    }
    return <Tabs type="editable-card" animated={true} hideAdd={true} tabBarGutter={0} activeKey={currentKey} items={currentItems} onChange={setCurrentKey} onEdit={handleRemove} />;
}

// 数据块渲染
const DataBlockRender = ({ state, context, manageBlock, getCurrentNode }) => {
    const { outputData, errorMsg } = state;
    let currentNode = getCurrentNode();
    const OutputEle = StrUtil.isBlank(errorMsg) ? convertOuput(outputData) : [];
    let alertMessage = StrUtil.isBlank(errorMsg) && !OutputEle ? "" : errorMsg;
    if (outputData && !StrUtil.isBlank(alertMessage)) alertMessage = "无渲染组件";
    let children = null;
    if (StrUtil.isBlank(alertMessage)) {
        children = (OutputEle instanceof Function ? React.createElement(OutputEle) : (OutputEle ? OutputEle : null));
        if (!children) {
            children = React.cloneElement(manageBlock)
            currentNode = null;
        }
    } else {
        children = <>{React.cloneElement(manageBlock)}<div style={{ margin: '15px' }}><Row><Col span={8}><Alert message={alertMessage} type="error" /></Col></Row></div></>;
        currentNode = null;
    }
    return <TabPanel updateItem={!!currentNode} items={getItems(context.category, currentNode, children)} />
}

// 获取选项卡内容
const getItems = (() => {
    const rootTab = {
        key: "console|index",
        label: "控制台",
        closable: false,
        children: null
    }
    const cache = {};
    const get = (k) => {
        if (cache[k] === undefined) {
            cache[k] = [{ ...rootTab }];
        }
        return cache[k];
    }
    return (category, node, children) => {
        const _items = get(category);
        if (!node) {
            _items[0].children = children;
            return _items;
        }
        let add = true;
        const newItem = {
            key: node.code,
            label: node.name || '-',
            children
        }
        for (let idx = 0; idx < _items.length; idx++) {
            const item = _items[idx];
            if (item.key === newItem.key) {
                _items[idx] = newItem;
                add = false;
                break
            }
        }
        if (add) _items.push(newItem)
        return _items;
    }
})();

// 模板页面
const TemplatePage = ({ category, name }) => {
    return <>
        <Title level={3}>{name}</Title>
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
            dataUseMange={true}
            // 数据区
            dataBlockRender={DataBlockRender}
        />
    </>
}

export default TemplatePage;