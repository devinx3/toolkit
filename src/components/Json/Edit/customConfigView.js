import React from 'react';
import { Button, Input, Modal, Tooltip, message, Row, Col, List, Skeleton, Checkbox, Popover, Typography, Upload} from 'antd';

import JsonEditService from '../../../services/JsonEditService'
import CodeEditView from './codeEdit'
import CryptoJS from 'crypto-js';
import * as dayjs from 'dayjs'
import FileUtil from '../../../utils/FileUtil'

import { EditOutlined, DeleteOutlined, ImportOutlined, ExportOutlined } from '@ant-design/icons';


const ConfigItem = ({config, refreshView, handleConvertData}) => {
    const [scriptContent, setScriptContent] = React.useState(config.scriptContent);
    const [visible, setVisible] = React.useState(false);
    const [configName, setConfigName] = React.useState(config.name);
    const [configDesc, setConfigDesc] = React.useState(config.description);

    const showModal = () => {
        setVisible(true);
    };
    const handleSaveConfig = () => {
        if (!scriptContent) {
            message.error('脚本不能为空');
            return;
        }
        const newConfig = {...config, name: configName || config.name, description: configDesc || config.description, scriptContent: scriptContent};
        const updateResult = JsonEditService.updateConfig(newConfig);
        if (updateResult !== true) {
            message.error('更新失败, 失败原因: ' + updateResult);
            return;
        }
        message.success('更新成功');
        setVisible(false);
        // 刷新整个view
        refreshView();
    };
    const handleRemoveConfig = () => {
        const deleteResult = JsonEditService.deleteConfig(config.id);
        if (deleteResult !== true) {
            message.error('删除失败, 失败原因: ' + deleteResult);
            return;
        }
        message.success('删除成功');
        setVisible(false);
        // 刷新整个view
        refreshView();
    };
    const handleCancel = () => {
        setVisible(false);
    };
    // 重置
    const handleReset = () => {
        setConfigName(config.name)
        setConfigDesc(config.description)
        setScriptContent(config.scriptContent)
    };
    return (<>
        <Tooltip style={{marginLeft: '15px'}} title={config.description}><Button type="dashed" onClick={e => handleConvertData(config.scriptContent)}>{config.name}</Button></Tooltip>
        <Tooltip title="编辑"><Button shape="circle" type="text" onClick={showModal} icon={<EditOutlined />} size="small" /></Tooltip>

        <Modal title={"编辑脚本配置"} open={visible} width='75%' onCancel={handleCancel}
            footer={[
                <Button key="cancel" onClick={handleCancel}>取消</Button>,
                <Button key="reset" onClick={handleReset}>重置</Button>,
                <Button key="remove" onClick={handleRemoveConfig}>删除配置</Button>,
                <Button key="update" type="primary" onClick={handleSaveConfig}>更新配置</Button>
            ]} >
            <Input addonBefore={'功能名称'} value={configName} onChange={e => setConfigName(e.target.value)}/>
            <Input style={{marginTop: '3px'}} addonBefore={'功能作用'} value={configDesc} onChange={e => setConfigDesc(e.target.value)}/>
            <br/><br/>
            <CodeEditView value={scriptContent} onChange={e => setScriptContent(e.target.value)} />
        </Modal>
    </>);
}

// 数据处理
const DataHandle = {
    // 加密
    encrypt: (str, secret) => {
        return CryptoJS.AES.encrypt(str, secret).toString();
    },
    // 解密
    dencrypt: (str, secret) => {
        return CryptoJS.AES.decrypt(str, secret).toString(CryptoJS.enc.Utf8);
    },
    // 特征前缀
    featurePrefix: 'devinx3',
    // 秘钥前缀(前缀长度固定3位)
    verionPrefix: 'ver',
    // 固定版本(版本长度固定3位)
    fixVersion: '000',
    // 固定秘钥(秘钥长度固定6位)
    fixSecret: 'ver000',
    // 转换秘钥(秘钥长度固定6位)
    convertSecret: verion => {
        if (verion >= 100 && verion <= 999) {
            return DataHandle.verionPrefix + verion;
        }
        return DataHandle.fixSecret;
    },
    // 转换特征(secret: 秘钥)
    getFeatureSuffix: secret => {
        return secret === DataHandle.fixSecret ? 'S' : 'l';
    },
    // 获取特征秘钥索引(索引顺序从小到大)
    getFeatureSecretIndex: processLen => {
        if (processLen < 100) {
            return -1;
        }
        const start = 10;
        // 结尾长度10也不用
        const useLength = processLen - 10 - start;
        const result = [];
        const prime = [3, 11, 17, 19, 23, 27];
        for (let i = 0; i < 6; i++) {
            // 索引 = 开始位置 + (使用长度 * 质数 / 30)
            result.push(start + ((useLength * prime[i] / 30) ^ 0));
        }
        return result;
    },
    // 指定索引添加值
    addSecret: (str, index, value) => {
        return str.slice(0, index) + value + str.slice(index);
    },
    // 删除指定索引的值
    removeSecret: (str, index) => {
        return str.slice(0, index) + str.slice(index + 1);
    },
    // 转换导出数据
    convertExportData: (str, verion) => {
        // 秘钥组成
        // 以 devinx3 开头
        // 后面接长度以l/S结束(仅仅当默认密码时为S, 否则为l)(这里的值不要和特征前缀存在相同字符)
        // 当密文长度小于100时, 使用默认秘钥重新加密
        // 当密文长度大于等于100时, 根据秘钥长度获取索引位置, 从而将秘钥保存到字符串中
        // 即: processPrefix(特征前缀) + processLen(数据长度) + processSuffix(特征后缀) + encryptData(可能包含秘钥的加密字符串)

        // 秘钥
        let secret = DataHandle.convertSecret(verion);
        // 加密字符串
        let encryptData = DataHandle.encrypt(str, secret);
        // secret 将分布在 encryptData 字符串中
        if (encryptData.length < 100) {
            // 固定字符串
            secret = DataHandle.fixSecret;
            encryptData = DataHandle.encrypt(str, secret);
        }
        // 特征前缀
        const processPrefix = DataHandle.featurePrefix;
        // 数据长度
        const processLen = encryptData.length;
        // 特征后缀
        const processSuffix = DataHandle.getFeatureSuffix(secret);
        console.log(secret)
        if (secret === DataHandle.fixSecret) {
            // 返回结果
            return processPrefix + processLen + processSuffix + encryptData;
        }
        // 秘钥索引位置
        const secretIndex = DataHandle.getFeatureSecretIndex(processLen);
        let newEncryptData = encryptData;
        for (let i = secretIndex.length - 1; i >= 0; i--) {
            // 指定位置添加秘钥
            newEncryptData = DataHandle.addSecret(newEncryptData, secretIndex[i], secret[i]);
        }
        return processPrefix + processLen + processSuffix + newEncryptData;
    },
    // 转换导入数据
    convertImportData: (str) => {
        // 匹配特征前缀
        const processPrefix = str.slice(0, DataHandle.featurePrefix.length);
        if (processPrefix !== DataHandle.featurePrefix) {
            // 匹配特征前缀异常
            throw new Error('匹配特征前缀异常');
        }
        // 特征后缀
        const maxfeatureSuffixIndex = processPrefix.length + 10;
        let processSuffix = 'l';
        let processSuffixIndex = str.indexOf(processSuffix);
        if (processSuffixIndex < 0 || processSuffixIndex >= maxfeatureSuffixIndex) {
            processSuffix = 'S';
            processSuffixIndex = str.indexOf(processSuffix);
            if (processSuffixIndex < 0 || processSuffixIndex >= maxfeatureSuffixIndex) {
                // 匹配特征后缀异常
                throw new Error('匹配特征后缀异常');
            }
        }
        // 批量长度
        let processLen = Number(str.slice(processPrefix.length, processSuffixIndex));
        if (!processLen) {
            // 匹配数据长度异常
            throw new Error('匹配数据长度异常');
        }
        const secretIndex = DataHandle.getFeatureSecretIndex(processLen);
        const encryptData = str.slice(processSuffixIndex + 1);
        if (secretIndex === -1) {
            return DataHandle.encrypt(str, encryptData);
        }
        let newEncryptData = encryptData;
        let secret = '';
        for (let i = 0; i < secretIndex.length; i++) {
            // 指定位置
            secret = secret + newEncryptData[secretIndex[i]];
            newEncryptData = DataHandle.removeSecret(newEncryptData, secretIndex[i]);
        }
        return DataHandle.dencrypt(newEncryptData, secret);
    }
}


// 设置默认版本
const VERSION = 101;


// 配置管理
const ConfigManager = ({dataSource, refreshView}) => {

    // const input = DataHandle.convertExportData(JSON.stringify(dataSource), VERSION)
    // console.log('input', input)
    // const output = DataHandle.convertImportData(input)
    // console.log('output', output)
    // console.log(DataHandle)

    const [visible, setVisible] = React.useState(false);

    const [checkedList, setCheckedList] = React.useState([]);
    const [indeterminate, setIndeterminate] = React.useState(false);
    const [checkAllConfig, setCheckAllConfig] = React.useState(false);
    // 列表页勾选项
    const onChangeConfigItem = (e) => {
        const id = e.target.value;
        const list = [...checkedList];
        const index = list.indexOf(id);
        if (e.target.checked) {
            if (index < 0) {
                list.push(id);
            }
        } else {
            if (index >= 0) {
                list.splice(index, 1);
            }
        }
        console.log(list)
        setCheckedList(list);
        setIndeterminate(!!list.length && list.length < dataSource.length);
        setCheckAllConfig(list.length === dataSource.length);
    }
    // 全部勾选页
    const onCheckAllChangeConfigItem = (e) => {
        if (e.target.checked) {
            const allList = [];
            for (let item of dataSource) {
                allList.push(item.id);
                console.log(item)
            }
            setCheckedList(allList);
        } else {
            setCheckedList([]);
        }
        setIndeterminate(false);
        setCheckAllConfig(e.target.checked);
    }
    // 清空所有勾选
    const clearCheckAll = () => {
        setCheckedList([]);
        setCheckAllConfig(false);
        setIndeterminate(false);
    }
    // 删除配置
    const handleDeleteConfig = () => {
        if (checkedList.length === 0) {
            message.info("没有选中任何行, 无需删除")
            return;
        }
        const result = JsonEditService.batchDeleteConfig(checkedList);
        if (result === true) {
            message.info("删除成功")
            clearCheckAll();
            refreshView();
            return;
        }
        message.warn("删除失败, 原因是: " + result)
    }
    // 导出配置
    const handleExportCOnfig = () => {
        if (checkedList.length === 0) {
            message.info("没有选中任何行, 无需导出")
            return;
        }
        const source = [];
        for (let config of dataSource) {
            const obj = { ...config };
            delete obj['id']
            source.push(obj);
        }
        const exportData = DataHandle.convertExportData(JSON.stringify(dataSource), VERSION);
        const fileName = 'config' + dayjs().format('MMDDHHmmss');
        FileUtil.download(exportData, fileName);
    }
    // 导入配置
    const handleImportCOnfig = (file) => {
        FileUtil.readAsText(file, content => {
            let newList = null;
            try {
                newList = JSON.parse(DataHandle.convertImportData(content));
            } catch(e) {
                message.error("导入失败, 异常消息: " + e.message);
                return;
            }
            if (!(newList && newList.length && newList.length > 0)) {
                return;
            }
            let successCount = 0;
            let errorMsg = '';
            for (let config of newList) {
                config.name = config.name + '(by impory)';
                const result = JsonEditService.addConfig(config);
                if (result === true) {
                    successCount++;
                } else {
                    errorMsg = errorMsg + result + ";";
                }
            }
            if (successCount === 0) {
                message.error("全部导入失败, 异常消息: ");
                return;
            }
            if (successCount === newList.length) {
                message.info("全部导入成功");
            } else {
                message.warn("部分导入成功, 异常个数" + (newList.length - successCount) + ", 异常消息: " + errorMsg);
            }
            refreshView();
        });
        return false;
    }
    return (<>
        <Button type='link' onClick={() => setVisible(true)}>配置管理</Button>
        <Modal title={"配置管理"} open={visible} footer={null} onCancel={() => setVisible(false)} >
            <List
                itemLayout="horizontal"
                dataSource={dataSource}
                rowKey='id'
                header= {(<>
                    <Checkbox indeterminate={indeterminate} disabled={dataSource.length === 0} checked={checkAllConfig}
                                onChange={onCheckAllChangeConfigItem}>全选</Checkbox>
                    <Button type='text' disabled={dataSource.length === 0} icon={<DeleteOutlined />} onClick={handleDeleteConfig}>删除</Button>
                    <Button type='text' disabled={dataSource.length === 0} icon={<ExportOutlined />} onClick={handleExportCOnfig}>导出</Button>
                </>)}
                footer={<Upload maxCount={1} beforeUpload={(file) => handleImportCOnfig(file)} ><Button icon={<ImportOutlined />}>导入</Button></Upload>}
                renderItem={(item) => (
                    <List.Item
                      actions={[<Popover placement="left" 
                                        title={null} trigger="click"
                                        content={<div style={{whiteSpace: 'pre-wrap'}}><Typography.Paragraph code copyable>{item.scriptContent}</Typography.Paragraph></div>} 
                                        >
                                        <Button type='link' key="list-item-srcipt">脚本</Button>
                                </Popover>]}
                    >
                      <Skeleton loading={false}>
                        <List.Item.Meta
                          avatar={<Checkbox value={item.id} checked={checkedList.indexOf(item.id) >= 0} onChange={onChangeConfigItem} />}
                          title={item.name}
                          description={item.description}
                        />
                      </Skeleton>
                    </List.Item>
                  )}
             />
        </Modal>
    </>)
}

// 配置视图
const CustomConfigView = ({style, handleConvertData}) => {
    const [changeConfig, setChangeConfig ] = React.useState(false);
    const refreshView = () => {
        setChangeConfig(!changeConfig);
    }
    const dataSource = JsonEditService.listAll();
    if (!dataSource || dataSource.length === 0) {
        return (<Row style={style}><Col><ConfigManager dataSource={[]} refreshView={refreshView} /></Col></Row>);
    }

    return (<Row style={style}>
        <Col>
            <ConfigManager dataSource={dataSource} refreshView={refreshView} />
        </Col>
        <Col style={{marginLeft: '5px'}}>
            {dataSource.map(item => <ConfigItem key={item.id} config={item} refreshView={refreshView} handleConvertData={handleConvertData}/>)}
        </Col>
    </Row>);
}

export default CustomConfigView;

