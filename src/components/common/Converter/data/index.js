import React from "react"
import { Spin } from "antd";
import { LANG } from "../constants";
import { newConvert } from '../adaptor/exectorAdaptor'

// 设置数据块上下文
class DataBlockContext {
    constructor() {
        this.checkInputData = null;
    }
    setCheckInputData(checkInputData) {
        this.checkInputData = checkInputData
    }
    onCheckInputData(data) {
        return this.checkInputData ? this.checkInputData(data) : true;
    }
}

const DataBlock = ({ lang, category, context, manageBlock, dataBlockRender, handleInputObj }) => {

    const [inputData, setInputData] = React.useState('');
    const [outputData, setOutputData] = React.useState('');
    const [errorMsg, setErrorMsg] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const dataBlockContext = React.useMemo(() => new DataBlockContext(), []);

    // 设置转换方法
    context.setConvertHandler(scriptEvent => {
        if (loading) {
            console.warn("Conversion failed because loading");
            return;
        }
        setLoading(true)
        setTimeout(() => {
            // 异步线程执行
            const pass = dataBlockContext.onCheckInputData(inputData);
            if (pass !== true) {
                return setOutputData('') & setErrorMsg(pass) & setLoading(false)
            }
            const options = { enableJsx: lang === LANG.JSX }
            const onError = data => setOutputData('') & setErrorMsg(data);
            const onSuccess = data => data === '' ? onError('无执行结果') : setOutputData(data) & setErrorMsg('');
            try {
                newConvert(category, handleInputObj, scriptEvent, inputData, options)
                    .then(onSuccess)
                    .catch(onError)
                    .finally(() => setLoading(false))
            } catch (err) {
                setLoading(false);
                onError(err.message);
            }
        }, 60)
    });

    return <Spin spinning={loading} >
        {dataBlockRender({
            state: {
                inputData, setInputData, outputData, setOutputData, errorMsg, setErrorMsg,
            },
            manageBlock,
            context: {
                category
            },
            getCurrentNode: () => {
                const node = context.getNode() ? { ...context.getNode() } : {};
                node.code = (node.script ? "TMP|1|" : "TMP|0|") + node.code;
                return node;
            },
            setCheckInputData: fn => dataBlockContext.setCheckInputData(fn),
        })}
    </Spin>
}

export default DataBlock