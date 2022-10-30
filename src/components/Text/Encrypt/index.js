import React from 'react';
import { Divider, Typography, notification, Button, Input, Col, Row, Tooltip } from 'antd';

import CryptoJS from 'crypto-js';

const { Title, Text } = Typography;

// 预处理秘钥
function prepareSecret(secret){
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

const handleEncryptAES = (data, secret, writeResult) => {
    if(!checkData(data, secret)) {
        return;
    }
    writeResult(encryptData(data, secret))
}

const handleDencryptAES = (data, secret, writeResult) => {
    if(!checkData(data, secret)) {
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

const Encrypt = () => {

    const [inputData, setInputData] = React.useState('');
    const [outputData, setOutputData] = React.useState('');
    const [secret, setSecret] = React.useState('');

    return (<>
        <Title level={3}>加密/解密文本</Title>
        <Divider />

        <Row style={{marginTop: '10px'}}>
            <Text>待处理数据(仅支持UTF8)</Text>
            <Input.TextArea style={{marginTop: '5px'}} rows={8} value={inputData} onChange={e => setInputData(e.target.value)}/>
        </Row>
        <Row style={{marginTop: '10px'}}>
            <Col span={2}><Button type="primary" onClick={e => handleEncryptAES(inputData, secret, setOutputData)}>AES加密</Button></Col>
            <Col span={2}><Button type="primary" onClick={e => handleDencryptAES(inputData, secret, setOutputData)}>AES解密</Button></Col>
            <Col span={8}><Input addonBefore={<Tooltip title='秘钥长度小于32, 会对秘钥加密'>秘钥</Tooltip>} placeholder="secret" value={secret} onChange={e => setSecret(e.target.value)}/></Col>
        </Row>

        <Row style={{marginTop: '10px'}}>
            <Text>处理后数据</Text>
            <Input.TextArea style={{marginTop: '5px'}} rows={8} value={outputData} />
        </Row>

    </>);
}
export default Encrypt;