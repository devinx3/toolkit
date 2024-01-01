import { message, Modal } from 'antd';
import ReactDOM from 'react-dom/client';
import React from 'react';
import lodash from 'lodash'
import dayjs from 'dayjs';
import cryptoJS from 'crypto-js';
import * as XLSX from 'xlsx'
import StrUtil from '../../../../utils/StrUtil'
import { BetaSchemaForm } from '@ant-design/pro-components';

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
    }
}

/**
 * js 执行器
 * @param {string} source   待执行的脚本
 * @param {string} inputStr 输入字符串
 * @param {Object} inputObj JSON对象
 * @returns {string} 脚本执行结果
 */
function exector(source, inputStr, inputObj) {
    const Fun = Function;
    const execFun = new Fun('inputData', 'inputObj', 'Util', source);
    return execFun(inputStr, inputObj, { ...exectorUtilParam });
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
 * 执行转换方法
 * @param {Function} handleInputObj 转换输入对象
 * @param {string} input 输入内容
 * @param {string} scriptContent 脚本内容
 */
function doConvert(handleInputObj, input, scriptContent) {
    // 将 JSON 字符串转换成 JSON 对象
    const inputObj = handleInputObj ? handleInputObj(input) : null;
    return exector(scriptContent, input, inputObj);
}

/**
 * 将执行结果转换转换成字符串
 * @param {any} result 执行结果对象
 */
function convertResult(result) {
    // 如果是 Object 对象则转换成字符串, 否则返回原对象(基本都是字符串)
    return (result instanceof Object) ? JSON.stringify(result, null, 2) : defaultIfNullUndefined(result, '')
}

/**
 * 转换消息
 * @param {string} name 脚本名称
 * @param {{message: string} | string} msgObj 消息
 */
function convertErrorMessage(name, msgObj) {
    const msg = (msgObj instanceof Object) ? defaultIfNullUndefined(msgObj.message, '') : msgObj;
    return name === null || name === undefined ? msg : `${name}: ${msg}`;
}

/**
 * 新建一个转换方法
 * @param {Function} handleInputObj  转换输入对象
 * @param {(string[] | { name: string, content: string }[])} scriptList  待执行脚本集合
 * @param {string} inputData 输入数据
 */
export function newConvert(handleInputObj, scriptList, inputData) {
    return new Promise((resolve, reject) => {
        // 执行成功回调
        const onSuccess = data => resolve(convertResult(data));
        // 执行异常回调
        const onFail = (name, err) => console.error(err) & reject(convertErrorMessage(name, err));
        let input = inputData;
        let output = '';
        for (let i = 0; i < scriptList.length; i++) {
            const scriptItem = scriptList[i];
            const name = scriptItem.name;
            const script = StrUtil.isStr(scriptItem) ? scriptItem : scriptItem.content;
            try {
                output = doConvert(handleInputObj, input, script);
                if (output instanceof Promise) {
                    output.then(v => {
                        if (i >= scriptList.length - 1) {
                            onSuccess(v)
                            return;
                        }
                        newConvert(handleInputObj, scriptList.splice(i + 1), v).then(resolve).catch(reject)
                    }).catch(v => {
                        onFail(name, v)
                    });
                    return;
                }
            } catch (error) {
                onFail(name, error);
                return;
            }
            input = output;
        }
        onSuccess(output)
    })
}
