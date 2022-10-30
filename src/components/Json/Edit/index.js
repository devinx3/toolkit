import React from 'react';
import { Alert, Divider, Typography, Button, Input, Col, Row, message, Modal, Upload, Popconfirm } from 'antd';
import StrUtil from '../../../utils/StrUtil'
import FileUtil from '../../../utils/FileUtil'
import CustomView from './customView';
import { CopyOutlined, UploadOutlined, DownloadOutlined} from '@ant-design/icons';
import CodeEditView from './codeEdit';
import JsonEditService from '../../../services/JsonEditService';
import * as dayjs from 'dayjs'

const { Title } = Typography;

// 执行器参数
const exectorUtilParam = {
    dayjs: dayjs,
}

// js 执行器
const JsExector = (source, input) => {
    const Fun = Function;
    const execFun = new Fun('inputObj', 'Util', source);
    return execFun(input, exectorUtilParam);
}

// 复制按钮的样式
const copyStype = {
    before: { 
        fontSize: '16px', 
        color: '#08c' , 
        cursor: 'pointer'
    },
    after: { 
        fontSize: '16px', 
        color: '#0c0' , 
        cursor: 'pointer'
    },
}

// 输入框发生改变
const handleInputChange = (e, setInputCode, setOutputData) => {
    setInputCode(e.target.value);
    setOutputData(null);
}

/**
 * 转换为JSON对象
 * @param input 待处理的数据
 * @param setError 设置异常信息
 */
const handleOutput = (input, setOutput, convert, setCopyStyleClass) => {
    if (input === undefined || input === null || input === '' || input.trim() === '') {
        setOutput("请输入JSON字符串");
        return;
    }
    let outData;
    try {
        outData = JSON.parse(input);
    } catch (e) {
        setOutput(e.message);
        return;
    }
    if (outData.constructor !== Object) {
        setOutput("请输入正确的JSON字符串");
        return;
    }
    try {
        outData = convert(outData);
    } catch (e) {
        console.log("数据转换出现异常", e)
        setOutput("数据转换出现异常: " + e.message);
        return;
    }
    setOutput(outData);
    setCopyStyleClass(copyStype.before)
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

// 便利JSON对象
const traverseJsonObj = (obj, convert) => {
    if(obj === undefined || obj === null) {
        return obj;
    }
    //如果发现数组值中有对象，则再次进入迭代
    if (obj.constructor === Array) {
        for (let index = 0; index < obj.length; index++) {
            traverseJsonObj(obj[index])
        }
        return obj;
    }
    if (obj.constructor === Object) {
        obj = convert(obj);
        if(obj === undefined || obj === null) {
            return;
        }
        for (let key in obj) {
            if(obj === undefined || obj === null) {
                continue;
            }
            if (obj[key].constructor === Object) {
                obj[key] = convert(obj[key]);
            }
        }
    }
    return obj;
}

// 删除值为null的对象
const handleDeleteNull = (input, setOutput, setCopyStyleClass) => {
    handleOutput(input, setOutput, jsonObj => delNullProperty(jsonObj), setCopyStyleClass);
}

// key 下划线转驼峰
const handleKeCamelCase = (input, setOutput, setCopyStyleClass) => {
    handleOutput(input, setOutput, jsonObj => {
        return traverseJsonObj(jsonObj, obj => {
            const result = {};
            for (let key in obj) {
                result[StrUtil.underlineToHump(key)] = obj[key];
            }
            return result;
        });
    }, setCopyStyleClass);
}

// 自定义格式转换
const handleCuszConvert = (input, setOutput, scriptContent, setCopyStyleClass) => {
    handleOutput(input, setOutput, jsonObj => JsExector(scriptContent, jsonObj), setCopyStyleClass);
}
// 格式化输入
const handleFormatInput = (input, setInputCode, setError) => {
    if (input === undefined || input === null || input === '' || input.trim() === '') {
        setError("请输入JSON字符串");
        return;
    }
    try {
        setInputCode(JSON.stringify(JSON.parse(input), null, 2))
        setError(null)
    } catch (e) { 
        setError(e.message)
    }
}
// 压缩输入
const handleCompressInput = (input, setInputCode, setError) => {
    if (input === undefined || input === null || input === '' || input.trim() === '') {
        setError("请输入JSON字符串");
        return;
    }
    try {
        setInputCode(JSON.stringify(JSON.parse(input)))
        setError(null)
    } catch (e) { 
        setError(e.message)
    }
}

// 文件上传
const handelInputUpdalod = (file, setInputCode) => {
    FileUtil.readAsText(file, setInputCode)
    return false;
}

// 复制按钮点击事件
const handleCopyClick = (outputData, setCopyStyleClass) => {
    if (StrUtil.copyToClipboard(JSON.stringify(outputData))) {
        setCopyStyleClass(copyStype.after);
        message.info("复制成功")
    }
}

// 复制按钮点击事件
const handleDownloadClick = (outputData) => {
    FileUtil.download(JSON.stringify(outputData), 'output.json')
}

// 自定义处理逻辑
const ConvertModal = ({inputCode, setError, handleConvertOutput, refreshWholeEditView}) => {
    const [convertDta, setConvertDta] = React.useState('return inputObj;');
    const [visible, setVisible] = React.useState(false);
    const showModal = () => {
        if (inputCode === undefined || inputCode === null || inputCode === '' || inputCode.trim() === '') {
            setError("请输入JSON字符串");
            return;
        }
        setVisible(true);
    };
    const handleCancelConvert = () => {
        setVisible(false);
      };
    const handleConfirmConvert = () => {
        handleConvertOutput(convertDta);
        setVisible(false);
    };
    const handleAddConfigSuccess = () => {
        // 影藏窗口
        setVisible(false)
        // 刷新父级页面
        refreshWholeEditView();
    }
    return (<>
        <Button onClick={showModal}>自定义数据处理</Button>
        <Modal title="自定义数据处理" open={visible} width='75%'
            onCancel={handleCancelConvert}
            footer={[
                <AddConfigView key='add' scriptContent={convertDta} callAddConfigSuccess={handleAddConfigSuccess} />,
                <Button key="cancel" onClick={handleCancelConvert}>取消</Button>,
                <Button key="convert" type="primary" onClick={handleConfirmConvert}>转换</Button>
            ]} >
            <CodeEditView value={convertDta} onChange={e => setConvertDta(e.target.value)}/>
        </Modal>
    </>);
}


const defaultConfigName = '自定义配置';
const AddConfigView = ({scriptContent, callAddConfigSuccess}) => {
    const [configName, setConfigName] = React.useState();
    const [configDesc, setConfigDesc] = React.useState();
    const handleAddConfig = () => {
        if (!scriptContent) {
            message.warn("脚本内容不能为空");
            return false;
        }
        const config = {
            name: configName || defaultConfigName,
            describe: configDesc || configName || defaultConfigName,
            scriptContent: scriptContent
        }
        console.log(config)
        const addResult = JsonEditService.addConfig(config);
        if (addResult !== true) {
            message.error("添加配置失败, 失败原因: " + addResult);
        }
        message.success("添加配置成功")
        setConfigName(null)
        setConfigDesc(null)
        callAddConfigSuccess()
    }

    
    return (<Popconfirm icon={null} cancelText='取消' okText='确认'
        onConfirm={handleAddConfig}
        title={<>
            <Input addonBefore={'功能名称'} placeholder={defaultConfigName} value={configName} onChange={e => setConfigName(e.target.value)} />
            <Input style={{marginTop: '3px'}} addonBefore={'功能作用'} placeholder={defaultConfigName} value={configDesc} onChange={e => setConfigDesc(e.target.value)} />
            </>} >
        <Button>添加自定义配置</Button>
    </Popconfirm>);
}

const JsonEdit = () => {
    const [inputCode, setInputCode] = React.useState('');
    const [outputData, setOutputData] = React.useState('');
    const [copyStyleClass, setCopyStyleClass] = React.useState(copyStype.before);
    // 刷新组件
    const [refreshWhole, setRefreshWhole] = React.useState(false);

    const refreshWholeEditView = () => {
        setRefreshWhole(!refreshWhole);
    }

    return (<>
        <Title level={3}>编辑JSON</Title>
        <Divider />

        <Row style={{marginTop: '10px'}}>
            <Col><Button onClick={e => handleDeleteNull(inputCode, setOutputData, setCopyStyleClass)}>删除值为空的字段</Button></Col>
            <Col style={{marginLeft: '10px'}}><Button onClick={e => handleKeCamelCase(inputCode, setOutputData, setCopyStyleClass)}>JSON key 下划线转驼峰</Button></Col>
            <Col style={{marginLeft: '10px'}}><ConvertModal inputCode={inputCode} setError={setOutputData} refreshWholeEditView={refreshWholeEditView} handleConvertOutput={(scriptContent) => handleCuszConvert(inputCode, setOutputData, scriptContent, setCopyStyleClass)}/></Col>
        </Row>
        <CustomView  style={{marginTop: '20px'}} handleConvertData={(scriptContent) => handleCuszConvert(inputCode, setOutputData, scriptContent, setCopyStyleClass)}/>
        <Row style={{marginTop: '20px'}}>
            <Col span={7}>
                <Button size="small" 
                    style={{backgroundColor: '#428bca', color: '#fff', borderColor: '#357ebd'}} 
                    onClick={e => handleFormatInput(inputCode, setInputCode, setOutputData)} >格式化</Button>
                <Button size="small"
                    style={{marginLeft: '5px', backgroundColor: '#5cb85c', color: '#fff', borderColor: '#4cae4c'}} 
                    onClick={e => handleCompressInput(inputCode, setInputCode, setOutputData)}>压缩</Button>
                <Upload maxCount={1} beforeUpload={(file) => handelInputUpdalod(file, setInputCode)}>
                    <Button size="small" icon={<UploadOutlined />}
                        style={{marginLeft: '5px'}} >导入</Button>
                </Upload>
                <Input.TextArea autoSize={{ minRows: 27, maxRows: 90}}
                    style={{marginTop: '5px'}} rows={30} placeholder="待处理的JSON片段"
                    value={inputCode} onChange={e => handleInputChange(e, setInputCode, setOutputData)}/>
            </Col>
            <Col span={10} style={{marginLeft: '30px'}}>
                {outputData ? (StrUtil.isStr(outputData) ? 
                    <Alert message={outputData} type="error" /> :
                     (<>
                        <CopyOutlined style={copyStyleClass} onClick={() => handleCopyClick(outputData, setCopyStyleClass)} />
                        <DownloadOutlined style={{marginLeft: '8px'}} onClick={() => handleDownloadClick(outputData)}/>
                        <pre>{JSON.stringify(outputData, null, 2)}</pre>
                    </>)) : null}
            </Col>
        </Row>
    </>);
}

export default JsonEdit;