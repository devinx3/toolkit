import { message } from 'antd';
import lodash from 'lodash'
import dayjs from 'dayjs';
import cryptoJS from 'crypto-js';
import * as XLSX from 'xlsx'
import { ScriptExector, ScriptResult } from './index'
import { transform } from '@babel/standalone'

// 执行器参数
const exectorUtilParam = {
    _: lodash,
    dayjs: dayjs,
    cryptoJS: cryptoJS,
    XLSX: XLSX,
    message: message,
    importPlugin: (pluginName) => new Promise(pluginName)
}

// 导入插件
exectorUtilParam.importPlugin = (pluginName) => {
    if (pluginName === 'antd') {
        return import('antd');
    }
    throw new Error("不存在的插件：" + pluginName);
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
        // 转换中间值
        convertMedian: (stageNode, val) => {
            return handleInputObj && stageNode?.hasNext?.() ? convertResult(val) : val
        },
        transform: options.enableJsx ? code => transform(code, { presets: ["react"] })?.code : undefined,
    }
    return new ScriptExector(category, scriptEvent, handler, options).submit(inputData);
}
