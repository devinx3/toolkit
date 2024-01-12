import React from 'react';
import { Alert, Divider, Typography, Button, Input, Col, Row, message, Upload, Tooltip, Space, Radio } from 'antd';
import { LeftOutlined, UploadOutlined, InboxOutlined, DownloadOutlined } from '@ant-design/icons';
import Converter from '../../common/Converter';
import CopyButton from '../../common/CopyButton'
import StrUtil from '../../../utils/StrUtil'
import FileUtil from '../../../utils/FileUtil'
import { LANG } from '../../common/Converter/constants';
import CodeHelpView from './codeHelp';

const { Title } = Typography;
const { Dragger } = Upload


// 输入文件个数限制
const INPUT_FILE_LIMIT = 3;
const DataBlockRender = ({ state, setCheckInputData }) => {
    const { inputData, setInputData, outputData, setOutputData, errorMsg, setErrorMsg } = state;
    const [enableFile, setEnableFile] = React.useState();
    const [lastInpuData, setLastInpuData] = React.useState(inputData);

    // 重置输入内容
    const resetInputData = data => {
        setInputData(data);
        setOutputData('')
        setErrorMsg('')
    }
    // 切换输入方式
    const handleChangeInputWay = () => {
        const newEnableFile = !enableFile;
        setEnableFile(newEnableFile);
        setLastInpuData(inputData)
        if (newEnableFile && (lastInpuData === '' || lastInpuData === null || lastInpuData === undefined)) {
            resetInputData([]);
        } else {
            resetInputData(lastInpuData);
        }
    }
    // 校验输入数据
    setCheckInputData(() => {
        if (StrUtil.isBlank(inputData) || inputData.length === 0) {
            return enableFile ? "请上传文件" : "请输入文本";
        }
        return true;
    })
    // ========= 文件输入 =========
    const handleUploadInputFile = (file, fileList) => {
        if (inputData.length >= INPUT_FILE_LIMIT) {
            return false;
        }
        const newFileList = [...inputData];
        for (let i = 0; i < fileList.length; i++) {
            if (newFileList.length + 1 > INPUT_FILE_LIMIT) {
                break;
            }
            newFileList.push(fileList[i]);
        }
        resetInputData(newFileList)
        return Upload.LIST_IGNORE;
    }
    const handleRemoveInputFile = file => {
        const newFileList = inputData.filter(item => item.uid !== file.uid);
        resetInputData(newFileList)
        return true;
    }
    // ========= 文本输入 =========
    const handleInputChange = (e) => {
        resetInputData(e.target.value);
    }
    // 文件上传
    const handelInputUpdalod = (file) => {
        FileUtil.readAsText(file, setInputData)
        return false;
    }
    // ========= 输出 =========
    // 复制按钮点击事件
    const handleCopyData = () => {
        if (StrUtil.copyToClipboard(outputData)) {
            message.info("复制成功")
            return true;
        }
    }
    // 下载按钮点击事件
    const handleDownloadClick = () => {
        FileUtil.download(outputData, 'output.txt')
    }
    return <Row style={{ marginTop: '20px' }}>
        <Col span={7}>
            <Space>
                <Radio.Group
                    size="small"
                    optionType="button"
                    onChange={handleChangeInputWay}
                    options={[{ label: '文本', value: "0" }, { label: '文件', value: "1" }]}
                    value={enableFile ? "1" : "0"}
                />
                {enableFile ? null : (<Upload maxCount={1} beforeUpload={handelInputUpdalod} >
                    <Button size="small" icon={<UploadOutlined />} disabled={enableFile}
                        style={{ marginLeft: '5px' }} >导入</Button>
                </Upload>)}
            </Space>
            {
                enableFile ? (
                    <Dragger
                        name='file'
                        style={{ marginTop: '5px' }}
                        multiple={false}
                        maxCount={INPUT_FILE_LIMIT} fileList={inputData}
                        beforeUpload={handleUploadInputFile} onRemove={handleRemoveInputFile}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">单击或拖动文件到此区域</p>
                        <p className="ant-upload-hint">支持批量</p>
                    </Dragger>)
                    : (<Input.TextArea autoSize={{ minRows: 25, maxRows: 40 }} disabled={enableFile}
                        style={{ marginTop: '5px' }} rows={30} placeholder={enableFile ? "已输入文件" : "待处理的文本片段"}
                        value={enableFile ? '' : inputData} onChange={handleInputChange} />)
            }
        </Col>
        <Col span={10} style={{ marginLeft: '30px' }}>
            {!StrUtil.isBlank(errorMsg) ?
                <Alert message={errorMsg} type="error" /> :
                StrUtil.isBlank(outputData) ? null : <>
                    <Space>
                        <Tooltip title={enableFile ? "" : "覆盖待处理输入框"}><Button type="text" icon={<LeftOutlined />} onClick={() => setInputData(outputData)} disabled={enableFile} /></Tooltip>
                        <CopyButton type='text' onClick={handleCopyData} size='small' />
                        <Tooltip title="下载"><DownloadOutlined style={{ marginLeft: '8px' }} onClick={() => handleDownloadClick(outputData)} /></Tooltip>
                    </Space>
                    {React.isValidElement(outputData) ? <pre>{outputData}</pre> : <div>{outputData}</div> }
                </>}
        </Col>
    </Row>
}

// 多行用一行拼接
const multiLine2Single = (inputData) => {
    const list = inputData.split("\n");
    return list.map(item => `"${item}"`).join(",");
}
// 编辑页面
const TextEdit = () => {
    return <>
        <Title level={3}>编辑文本</Title>
        <Divider />
        <Converter
            lang={LANG.TXT}
            manage={{
                // 基本按钮
                buttons: [
                    {
                        code: "multiLine2Single",
                        name: "多行转一行",
                        description: "多行合并成一行",
                        scriptContent: `const _INNER_ = ${multiLine2Single.toString()};return _INNER_(inputData);`
                    },
                    {
                        code: "originalData",
                        name: "输出",
                        description: "输出原数据",
                        scriptContent: `return inputData;`
                    }
                ],
                expandScriptButton: {
                    name: "自定义节点",
                    description: "支持转换和添加自定义节点",
                    scriptContent: "return inputData;"
                },
                // 编辑器帮助文档
                editorHelpRender: CodeHelpView
            }}
            // 数据区
            dataBlockRender={DataBlockRender}
        />
    </>
}
export default TextEdit;