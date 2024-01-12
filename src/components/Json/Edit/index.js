import React from 'react';
import { Alert, Divider, Typography, Button, Input, Col, Row, message, Upload, Tooltip, Space } from 'antd';
import { LeftOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import Converter from '../../common/Converter';
import CopyButton from '../../common/CopyButton'
import StrUtil from '../../../utils/StrUtil'
import FileUtil from '../../../utils/FileUtil'
import CodeHelpView from './codeHelp';
import { LANG } from '../../common/Converter/constants';

const { Title } = Typography;

const checkInputData = (input) => {
    if (StrUtil.isBlank(input) || input.trim() === '') {
        return "请输入JSON字符串";
    }
    return true;
}
const MB = 1024 * 1024; // 1MB
const OUTPUT_LIMIT = 2 * MB; // 2MB
const DataBlockRender = ({ state, setCheckInputData }) => {
    const { inputData: inputCode, setInputData: setInputCode,
        outputData, setOutputData, errorMsg, setErrorMsg } = state;
    setCheckInputData(checkInputData);
    // 输入框发生改变
    const handleInputChange = (e) => {
        setInputCode(e.target.value);
        setOutputData("");
        setErrorMsg("");
    }
    // 修改输入
    const handleChangeInput = (input, fn) => {
        const pass = checkInputData(input);
        if (pass !== true) {
            setErrorMsg(pass)
            return;
        }
        try {
            setInputCode(fn(input))
            setErrorMsg(null)
        } catch (e) {
            setErrorMsg(e.message)
        }
    }
    // 格式化输入
    const handleFormatInput = () => {
        handleChangeInput(inputCode, (input) => JSON.stringify(JSON.parse(input), null, 2))
    }
    // 压缩输入
    const handleCompressInput = () => {
        handleChangeInput(inputCode, (input) => JSON.stringify(JSON.parse(input)))
    }
    // 文件上传
    const handelInputUpdalod = (file) => {
        FileUtil.readAsText(file, setInputCode)
        return false;
    }
    // 复制按钮点击事件
    const handleCopyData = (neddCompress) => {
        const data = (neddCompress === true && StrUtil.isStr(outputData)) ? JSON.stringify(JSON.parse(outputData)) : outputData;
        if (StrUtil.copyToClipboard(data)) {
            message.info("复制成功")
            return true;
        }
    }
    const handleCopyCompressData = () => handleCopyData(true);
    // 下载按钮点击事件
    const handleDownloadClick = () => {
        FileUtil.download(outputData, 'output.json')
    }
    React.useEffect(() => {
        if (outputData && outputData.length > OUTPUT_LIMIT) {
            FileUtil.download(outputData, 'download.json')
            setErrorMsg(`文件超过 ${OUTPUT_LIMIT / MB} MB, 已自动下载`)
            setOutputData("");
        }
    }, [outputData, setErrorMsg, setOutputData])

    return <Row style={{ marginTop: '20px' }}>
        <Col span={7}>
            <Button size="small"
                style={{ backgroundColor: '#428bca', color: '#fff', borderColor: '#357ebd' }}
                onClick={handleFormatInput} >格式化</Button>
            <Button size="small"
                style={{ marginLeft: '5px', backgroundColor: '#5cb85c', color: '#fff', borderColor: '#4cae4c' }}
                onClick={e => handleCompressInput(inputCode, setInputCode, setOutputData)}>压缩</Button>
            <Upload maxCount={1} beforeUpload={handelInputUpdalod}>
                <Button size="small" icon={<UploadOutlined />}
                    style={{ marginLeft: '5px' }} >导入</Button>
            </Upload>
            <Input.TextArea autoSize={{ minRows: 25, maxRows: 40 }}
                style={{ marginTop: '5px' }} rows={30} placeholder="待处理的JSON片段"
                value={inputCode} onChange={handleInputChange} />
        </Col>
        <Col span={10} style={{ marginLeft: '30px' }}>
            {!StrUtil.isBlank(errorMsg) ?
                <Alert message={errorMsg} type="error" /> :
                (StrUtil.isBlank(outputData) || outputData.length > OUTPUT_LIMIT) ? null : <>
                    <Space>
                        <Tooltip title="覆盖待处理输入框"><Button type="text" icon={<LeftOutlined />} onClick={() => setInputCode(outputData)} /></Tooltip>
                        <CopyButton type='text'  onClick={handleCopyData} size="small"/>
                        <Tooltip title="下载"><DownloadOutlined style={{ marginLeft: '8px' }} onClick={() => handleDownloadClick(outputData)} /></Tooltip>
                        <CopyButton tipTitle="压缩并复制" type="dashed" onClick={() => handleCopyCompressData(true)} size='small' />
                    </Space>
                    <pre>{outputData}</pre>
                </>}
        </Col>
    </Row>
}
// 删除值为null 的方法
const delNullProperty = (obj) => {
    for (let i in obj) {//遍历对象中的属性
        if (obj[i] === undefined || obj[i] === null || obj[i] === "") {//首先除去常规空数据，用delete关键字
            delete obj[i]
        } else if (obj[i].constructor === Object) {//如果发现该属性的值还是一个对象，再判空后进行迭代调用
            if (Object.keys(obj[i]).length === 0) delete obj[i]//判断对象上是否存在属性，如果为空对象则删除
            delNullProperty(obj[i])
        } else if (obj[i].constructor === Array) {//对象值如果是数组，判断是否为空数组后进入数据遍历判空逻辑
            if (Array.prototype.isPrototypeOf(obj[i]) && obj[i].length === 0) {
                delete obj[i]
            } else {
                for (let index = 0; index < obj[i].length; index++) {//遍历数组
                    if (obj[i][index] === undefined || obj[i][index] === null || obj[i][index] === "" || JSON.stringify(obj[i][index]) === "{}") {
                        obj[i].splice(index, 1)//如果数组值为以上空值则修改数组长度，移除空值下标后续值依次提前
                        index--//由于数组当前下标内容已经被替换成下一个值，所以计数器需要自减以抵消之后的自增
                    }
                    if (obj[i][index].constructor === Object || obj[i][index].constructor === Array) {//如果发现数组值中有对象，则再次进入迭代
                        delNullProperty(obj[i][index])
                    }
                }
            }
        }
    }
    return obj;
}
// 下划线转驼峰
const underlineToHump = (obj) => {
    if (obj === undefined || obj === null) {
        return obj;
    }
    const convert = source => {
        const result = {};
        for (let key in source) {
            const newKey = key.replace(/_(\w)/g, function (all, letter) {
                return letter.toUpperCase();
            })
            result[newKey] = source[key];
        }
        return result;
    }
    //如果发现数组值中有对象，则再次进入迭代
    if (obj.constructor === Array) {
        for (let index = 0; index < obj.length; index++) {
            obj[index] = underlineToHump(obj[index], convert)
        }
        return obj;
    } else if (obj.constructor === Object) {
        obj = convert(obj);
        if (obj === undefined || obj === null) {
            return;
        }
        for (let key in obj) {
            if (obj[key] && (obj[key].constructor === Object || obj[key].constructor === Array)) {
                obj[key] = underlineToHump(obj[key], convert)
            }
        }
    }
    return obj;
}
// 编辑页面
const JsonEdit = () => {
    return <>
        <Title level={3}>编辑JSON</Title>
        <Divider />
        <Converter
            lang={LANG.JSON}
            manage={{
                // 基本按钮
                buttons: [
                    {
                        code: "delNullProperty",
                        name: "删除空字段",
                        description: "删除值为空的字段",
                        scriptContent: `const _INNER_ = ${delNullProperty.toString()};return _INNER_(inputObj);`
                    }, {
                        code: "underlineToHump",
                        name: "下划线转驼峰",
                        description: "JSON key 下划线转驼峰",
                        scriptContent: `const _INNER_ = ${underlineToHump.toString()};return _INNER_(inputObj);`
                    }
                ],
                // 自定义按钮描述默认值
                expandScriptButton: {
                    name: "自定义节点",
                    description: "支持转换和添加自定义节点",
                    scriptContent: "return inputObj;"
                },
                // 编排按钮
                expandCombinationButton: {
                    name: "自定义编排",
                    description: "支持多脚本顺序执行",
                },
                // 编辑器帮助文档
                editorHelpRender: CodeHelpView
            }}
            // 数据区
            dataBlockRender={DataBlockRender}
        />
    </>
}
export default JsonEdit;