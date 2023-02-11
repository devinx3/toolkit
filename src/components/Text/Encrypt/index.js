import React from 'react';
import { Divider, Typography, notification, Button, Input, Col, Row, Upload, Tooltip, message } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import CopyButton from '../../common/CopyButton'
import FileUtil from '../../../utils/FileUtil'
import GlobalUtil from '../../../utils/GlobalUtil'
import StrUtil from '../../../utils/StrUtil'
import CryptoJS from 'crypto-js';

const { Title, Text } = Typography;

// 预处理秘钥
function prepareSecret(secret) {
    if (!secret) {
        secret = 'secret';
    }
    if (secret.length < 32) {
        secret = CryptoJS.MD5(secret).toString()
    }
    return secret;
}

// 加密数据
function encryptData(data, secret) {
    return CryptoJS.AES.encrypt(data, prepareSecret(secret)).toString();
}

// 解密数据
function dencryptData(data, secret) {
    return CryptoJS.AES.decrypt(data, prepareSecret(secret)).toString(CryptoJS.enc.Utf8);
}

// 数据校验
function checkData(data, secret) {
    if (!data) {
        notification.error({
            description: '请输入待处理数据',
            placement: 'top'
        });
        return false;
    }
    if (!secret) {
        notification.info({
            description: '未输入秘钥, 已自动设置秘钥',
            placement: 'top'
        });
    }
    return true;
}

// AES 加密
const handleEncryptAES = (data, secret, writeResult) => {
    if (!checkData(data, secret)) {
        return;
    }
    writeResult(encryptData(data, secret))
}

// AES 解密
const handleDencryptAES = (data, secret, writeResult) => {
    if (!checkData(data, secret)) {
        return;
    }
    try {
        const result = dencryptData(data, secret);
        if (result === '') {
            notification.error({
                description: '解密失败, 请检查秘钥是否正确',
                placement: 'top'
            });
        }
        writeResult(result)
    } catch (e) {
        notification.error({
            description: '解密失败, 请检查秘钥是否正确, 异常: ' + e.message,
            placement: 'top'
        });
        writeResult('')
    }
}

// 上传到输入框
const handleUploadToInput = (file, setInputData, setSecret) => {
    FileUtil.readAsText(file, content => {
        setInputData(content);
        if (GlobalUtil.enableAdvance()) {
            setSecret(file.name)
        }
    });
    return false;
}

// 下载输出框内容
const handelDownloadFromOuput = (outputData, secret) => {
    let fielName = null;
    if (GlobalUtil.enableAdvance()) {
        fielName = secret;
    }
    FileUtil.download(outputData, fielName);
}

// 复制输出框内容
const handelCopyFromOuput = (outputData) => {
    const result = StrUtil.copyToClipboard(outputData);
    if (result) {
        message.success("复制成功");
        return true;
    } else {
        message.warn("复制失败, " + result);
    }
}

const Encrypt = () => {

    const [inputData, setInputData] = React.useState('');
    const [outputData, setOutputData] = React.useState('');
    const [secret, setSecret] = React.useState('');

    return (<>
        <Title level={3}>加密/解密文本</Title>
        <Divider />

        <Row style={{ marginTop: '10px' }}>
            <Text>待处理数据(仅支持UTF8)</Text>
            <Tooltip title='导入'>
                <Upload maxCount={1} beforeUpload={(file) => handleUploadToInput(file, setInputData, setSecret)} showUploadList={false} >
                    <Button icon={<UploadOutlined />} type='text' size='small'></Button>
                </Upload>
            </Tooltip>
            <Input.TextArea style={{ marginTop: '5px' }} rows={8} value={inputData} onChange={e => setInputData(e.target.value)} />
        </Row>
        <Row style={{ marginTop: '10px' }}>
            <Col span={2}><Button type="primary" onClick={e => handleEncryptAES(inputData, secret, setOutputData)}>AES加密</Button></Col>
            <Col span={2}><Button type="primary" onClick={e => handleDencryptAES(inputData, secret, setOutputData)}>AES解密</Button></Col>
            <Col span={8}><Input addonBefore={<Tooltip title='秘钥长度小于32, 会对秘钥加密'>秘钥</Tooltip>} placeholder="secret" value={secret} onChange={e => setSecret(e.target.value)} /></Col>
        </Row>

        <Row style={{ marginTop: '10px' }}>
            <Text>处理后数据</Text>
            <Tooltip title='下载'>
                <Button type='text' disabled={!outputData} icon={<DownloadOutlined />} onClick={() => handelDownloadFromOuput(outputData, secret)} size='small'></Button>
            </Tooltip>
            <CopyButton type='text' disabled={!outputData} onClick={() => handelCopyFromOuput(outputData)} size='small' />
            <Input.TextArea style={{ marginTop: '5px' }} rows={8} value={outputData} />
        </Row>

    </>);
}
export default Encrypt;