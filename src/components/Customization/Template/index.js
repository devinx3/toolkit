import React from 'react';
import { Typography, Alert, Col, Row, Tabs, Result, Popover, Button } from 'antd';
import Converter from '../../common/Converter';
import { ScriptResult } from '../../common/Converter/adaptor/index';
import { LANG } from '../../common/Converter/constants';
import StrUtil from '../../../utils/StrUtil'
import CodeHelpView from './codeHelp';
import AIView from './AIView';

const { Title } = Typography;

// 解析输出元素
export const convertOuput = (outputData) => {
    let outputEle = outputData instanceof ScriptResult ? outputData.get() : outputData;
    if (!React.isValidElement(outputEle) && !(outputEle instanceof Function)) outputEle = undefined;
    return outputEle;
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
    return (category, node, children, manageBlock) => {
        const _items = get(category);
        if (!node) {
            _items[0].children = children;
            return _items;
        }
        _items[0].children = manageBlock || _items[0].children;
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
// 是否更新选项卡
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
const TabPanel = ({ items }) => {
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
    return <Tabs type="editable-card" animated={true} hideAdd={true} size='small' tabBarGutter={0} activeKey={currentKey} items={currentItems} onChange={setCurrentKey} onEdit={handleRemove} />;
}

export class ScriptErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { didCatch: false };
        this.printed = false;
    }
    static getDerivedStateFromError(error) {
        return { didCatch: true, error };
    }
    getErrorMsg() {
        if (!this.state.error) return '';
        return this.state.error.message;
    }
    componentDidCatch(error, info) {
        console.debug(`[${this.props.nodeName || '-'}]: 错误详情\n`, error);
    }
    render() {
        if (this.state.didCatch) {
            return <Result status='error' title="很抱歉, 脚本执行中发生了异常"
                subTitle={<Popover title={this.getErrorMsg()} placement="bottomLeft" trigger='hover'>
                    <Button>详情</Button>
                </Popover>}>
            </Result>
        }
        return this.props.children;
    }
}

// 数据块渲染
const DataBlockRender = ({ state, context, manageBlock, getCurrentNode }) => {
    const { outputData, errorMsg } = state;
    let currentNode = getCurrentNode();
    const OutputEle = StrUtil.isBlank(errorMsg) ? convertOuput(outputData) : [];
    let alertMessage = StrUtil.isBlank(errorMsg) && !OutputEle ? "" : errorMsg;
    let children = null;
    if (StrUtil.isBlank(alertMessage)) {
        if (OutputEle) {
            children = <ScriptErrorBoundary nodeName={currentNode?.name}>{OutputEle instanceof Function ? React.createElement(OutputEle) : OutputEle}</ScriptErrorBoundary>;
        } else {
            children = !outputData ? manageBlock : <>{manageBlock}<div style={{ margin: '15px' }}><Row><Col span={8}><Alert message={"无渲染组件"} type="error" /></Col></Row></div></>;
            currentNode = null;
        }
    } else {
        children = <>{manageBlock}<div style={{ margin: '15px' }}><Row><Col><Alert message={<pre style={{ marginBottom: 0, minWidth: "28vw" }}>{alertMessage}</pre>} type="error" /></Col></Row></div></>;
        currentNode = null;
    }
    return <TabPanel updateItem={!!currentNode} items={getItems(context.category, currentNode, children, manageBlock)} />
}

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
                editorHelpRender: CodeHelpView,
                // 智能窗口
                aiRender: AIView
            }}
            dataUseMange={true}
            // 数据区
            dataBlockRender={DataBlockRender}
        />
    </>
}

export default TemplatePage;