import { message, Modal } from 'antd';
import ReactDOM from 'react-dom/client';
import React from 'react';
import lodash from 'lodash'
import dayjs from 'dayjs';
import cryptoJS from 'crypto-js';
import * as XLSX from 'xlsx'
import { BetaSchemaForm } from '@ant-design/pro-components';
import { ScriptExector, ScriptResult } from './index'
import { transform } from '@babel/standalone'

// 执行器参数
const exectorUtilParam = {
    _: lodash,
    dayjs: dayjs,
    cryptoJS: cryptoJS,
    XLSX: XLSX,
    message: message
}

const containerId = 'converter-container';
/**
 * 创建 React 容器
 * @param {*} createChildren 创建子元素的回调方法
 * @returns Promise 子元素
 */
function createContainer(createChildren, options = {}) {
    const container = ReactDOM.createRoot(document.getElementById(containerId));
    const Container = ({ onSuccess, onError }) => {
        try {
            const handleClose = (res) => container.unmount();
            const handleCancel = (res) => handleClose() & onError(res);
            const child = createChildren({
                resolve: out => handleClose() & onSuccess(out),
                reject: err => handleClose() & onError(err),
            });
            const children = child instanceof Array ? child : [child];
            return React.createElement(Modal, {
                onCancel: () => handleCancel("已取消"),
                onOk: () => handleCancel("已取消"),
                footer: null,
                maskClosable: true,
                ...options,
                open: true,
                key: containerId + '-modal'
            }, React.createElement(React.Fragment, {}, ...children));
        } catch (err) {
            onError(err);
        }
    }
    return new Promise((resolve, reject) => {
        try {
            container.render(React.createElement(Container, { onSuccess: resolve, onError: reject }));
        } catch (err) {
            reject(err);
        }
    })
}
// 添加 UI 帮助类
exectorUtilParam.UIHelper = {
    createSchemaForm: (getSchemaFormProps) => {
        return createContainer(params => {
            const props = getSchemaFormProps(params) || {};
            props.layoutType = 'From';
            return <BetaSchemaForm {...props} />
        })
    },
    buildIOElement: (inEle, outEle) => {
        return ScriptResult.boxArea(inEle, outEle)
    }
}

/**
 * 如果obj为null或undefined, 则返回 other 对象
 * @param {any} obj 
 * @param {any} other 
 */
function defaultIfNullUndefined(obj, other) {
    return (obj === null || obj === undefined) ? other : obj;
}

/**
 * 将执行结果转换转换成字符串
 * @param {any} result 执行结果对象
 */
function convertResult(result) {
    if (result instanceof ScriptResult) return result;
    // 如果是 Object 对象则转换成字符串, 否则返回原对象(基本都是字符串)
    return (result instanceof Object) ? JSON.stringify(result, null, 2) : defaultIfNullUndefined(result, '')
}

/**
 * 新建一个转换方法
 * @param {Function} handleInputObj  转换输入对象
 * @param {(string[] | { name: string, content: string }[])} scriptList  待执行脚本集合
 * @param {string} inputData 输入数据
 */
export function newConvert(category, handleInputObj, scriptEvent, inputData, options = {}) {
    const handler = {
        getUtil: () => ({ ...exectorUtilParam }),
        before: (rootNode, _input) => ({ handleInputObj }),
        after: (rootNode, _output) => convertResult(_output),
        transform: options.enableJsx ? code => transform(code, { presets: ["react"] })?.code : undefined,
    }
    return new ScriptExector(category, scriptEvent, handler, options).submit(inputData);
}
