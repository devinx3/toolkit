import React from "react"
import { Spin } from "antd";
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

const DataBlock = ({ context, dataBlockRender, handleInputObj }) => {

    const [inputData, setInputData] = React.useState('');
    const [outputData, setOutputData] = React.useState('');
    const [errorMsg, setErrorMsg] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const dataBlockContext = React.useMemo(() => new DataBlockContext(), []);

    // 设置转换方法
    context.setConvertHandler(scriptList => {
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
            const onError = data => setOutputData('') & setErrorMsg(data);
            newConvert(handleInputObj, scriptList, inputData)
                .then(data => data === '' ? onError('无执行结果') : setOutputData(data) & setErrorMsg(''))
                .catch(onError)
                .finally(() => setLoading(false))
        }, 60)
    });

    return <Spin spinning={loading} >
        {dataBlockRender({
            state: {
                inputData, setInputData, outputData, setOutputData, errorMsg, setErrorMsg,
            },
            setCheckInputData: fn => dataBlockContext.setCheckInputData(fn),
        })}
    </Spin>
}

export default DataBlock