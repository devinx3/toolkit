import React from "react"
import { LANG } from "./constants";

const ManageBlock = React.lazy(() => import("./manage"))
const DataBlock = React.lazy(() => import("./data"))

/**
 * 转换事件上下文
 */
class ContextEvnet {
    constructor() {
        this.convertHandler = null;
    }
    // 设置转换器
    setConvertHandler(convertHandler) {
        this.convertHandler = convertHandler;
    }
    // 是否存在转换器
    hasConvertHandler() {
        return !!this.convertHandler;
    }
    // 执行转换方法
    onConvert(scriptList) {
        if (this.convertHandler) {
            return this.convertHandler(scriptList)
        }
        console.warn("No convert handler")
    }
}
// 将输入的数据转换成 Object 对象
const handleInputObjDataSource = {};
handleInputObjDataSource[LANG.JSON] = data => (data instanceof Object) ? data : JSON.parse(data);

/**
 * @typedef {{
 *      lang: string,
 *      manage: {
 *          buttons: {                  // 基本按钮
 *              name: string,           // 名称
 *              description: string,    // 描述
 *              scriptContent: string,  // 脚本内容
 *          }[],
 *          expandScriptButton: {       // 扩展按钮配置(*)
 *              name: string,           // 名称
 *              description: string,    // 描述
 *              scriptContent: string,  // 脚本内容
 *          },
 *          expandCombinationButton: {  // 自定义组合(*)
 *              name: string,           // 默认名称
 *              description: string,    // 默认描述
 *          },
 *          editorHelpRender: () => JSX.Element,    // 帮助文档(*)
 *      },
 *      handleInputObj: (data: string) => object,       // 数据输入转换成输入对象的转换方法(*)
 *      dataBlockRender: (props: {                      // 数据展示块
 *          state: {                                    // 数据展示块内部状态
 *              inputData: any,                         // 数据输入
 *              setInputData: (data: string) => void,   // 设置数据输入
 *              outputData: string,                     // 数据输出
 *              setOutputData: (data: string) => void,  // 设置数据输出
 *              errorMsg: string,                       // 异常数据
 *              setErrorMsg: (data: string) => void,    // 设置异常数据
 *          },
 *          setCheckInputData: (fn: (data: any) => boolean) => void, // 设置校验数据数据
 *      }) => JSX.Element,
 * }} ConverterType 类型定义
 * 
 * 转换对象
 * @param {ConverterType} props 属性
 */
const Converter = ({ lang = "txt", manage, handleInputObj, dataBlockRender }) => {
    const context = React.useMemo(() => new ContextEvnet(), []);
    // 默认配置
    const manageConfig = {
        lang,
        ...manage,
        context
    }
    const dataConfig = {
        context,
        dataBlockRender,
        handleInputObj: handleInputObj || handleInputObjDataSource[lang],
    };

    return <React.Suspense fallback={<></>}>
        <ManageBlock {...manageConfig} />
        <DataBlock {...dataConfig} />
    </React.Suspense>
}

export default Converter