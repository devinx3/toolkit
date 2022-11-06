import React from 'react';
import { Button, Input, Modal, Tooltip, message, Row, Col, List, Skeleton, Checkbox, Popover, Typography, Upload, Timeline, Table, Popconfirm} from 'antd';

import JsonEditService from '../../../services/JsonEditService'
import CodeEditView from './codeEdit'
import CryptoJS from 'crypto-js';
import * as dayjs from 'dayjs'
import FileUtil from '../../../utils/FileUtil'
import StrUtil from '../../../utils/StrUtil'

import { EditOutlined, DeleteOutlined, ImportOutlined, ExportOutlined, CopyOutlined, PlusOutlined } from '@ant-design/icons';

const ConfigItem = ({config, refreshView, handleConvertData}) => {
    const [scriptContent, setScriptContent] = React.useState(config.scriptContent);
    const [visible, setVisible] = React.useState(false);
    const [configName, setConfigName] = React.useState(config.name);
    const [configDesc, setConfigDesc] = React.useState(config.description);

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
    // 重置
    const handleReset = () => {
        setConfigName(config.name)
        setConfigDesc(config.description)
        setScriptContent(config.scriptContent)
    };
    return (<>
        <Tooltip style={{marginLeft: '15px'}} title={config.description}><Button type="dashed" onClick={e => handleConvertData(config.scriptContent)}>{config.name}</Button></Tooltip>
        <Tooltip title="编辑"><Button shape="circle" type="text" onClick={e => setVisible(true)} icon={<EditOutlined />} size="small" /></Tooltip>

        <Modal title={"编辑脚本配置"} open={visible} width='75%' onCancel={() => setVisible(false)}
            footer={[
                <Button key="cancel" onClick={() => setVisible(false)}>取消</Button>,
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

    const [visible, setVisible] = React.useState(false);

    const [checkedList, setCheckedList] = React.useState([]);
    const [indeterminate, setIndeterminate] = React.useState(false);
    const [checkAllConfig, setCheckAllConfig] = React.useState(false);

    const [scriptVisible, setScriptVisible] = React.useState(false);
    const [scriptModalContent, setScriptModalContent] = React.useState();
    

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
            message.success("删除成功")
            clearCheckAll();
            refreshView();
            return;
        }
        message.warn("删除失败, 原因是: " + result)
    }
    // 导出配置
    const handleExportConfig = () => {
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
    // 复制JSON配置
    const handleCopyConfig = () => {
        if (checkedList.length === 0) {
            message.info("没有选中任何行, 无法复制")
            return;
        }
        if (StrUtil.copyToClipboard(JSON.stringify(dataSource))) {
            message.success("复制成功")
        }
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
    // 打开弹出框
    const handleOpenScriptContentModal = (content) => {
        setScriptModalContent(content)
        setScriptVisible(true);
    }
    // 关闭弹出框
    const handleCloseScriptContentModal = () => {
        setScriptModalContent(null)
        setScriptVisible(false);
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
                    <Button type='text' disabled={dataSource.length === 0} icon={<ExportOutlined />} onClick={handleExportConfig}>导出</Button>
                    <Tooltip title="不支持导入"><Button type='text' disabled={dataSource.length === 0} icon={<CopyOutlined />} onClick={handleCopyConfig}>复制JSON配置</Button></Tooltip>
                </>)}
                footer={<Upload maxCount={1} beforeUpload={(file) => handleImportCOnfig(file)} ><Button icon={<ImportOutlined />}>导入</Button></Upload>}
                renderItem={(item) => (
                    <List.Item
                      actions={[<Button type='link' key="list-item-srcipt" onClick={() => handleOpenScriptContentModal(item.scriptContent)}>脚本</Button>]}
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
        <Modal title="脚本内容" open={scriptVisible} width="60%" footer={null} onCancel={handleCloseScriptContentModal} >
            <div style={{whiteSpace: 'pre-wrap'}}><Typography.Paragraph code copyable>{scriptModalContent}</Typography.Paragraph></div>
        </Modal>
    </>)
}


// 将数据源转换成对象
const convertConfigDataSource = (list1, list2) => {
    const data = {};
    for (let item of list1) {
        data[item.id] = { ...item };
    }
    for (let item of list2) {
        data[item.id] = { ...item };
    }
    return data;
}

// 配置表格弹出框
const ConfigTableModal = ({visible, setVisible, handleAddConfig, systemConfigDataSource, configDataSource}) => {
    const [selectKey, setSelectKey] = React.useState();
    // 加载数据源
    const loadDataSource = () => {
        const arr = [];
        for (let config of systemConfigDataSource) {
            arr.push({id: config.id, name: config.name, description: config.name, costom: 0});
        }
        for (let config of configDataSource) {
            arr.push({id: config.id, name: config.name, description: config.description, costom: 1});
        }
        return arr;
    }
    // 列
    const columns = [
        {
          title: '名称',
          dataIndex: 'name',
          render: (text, record) => <Tooltip title={record.description}>{text}</Tooltip>,
        },
        {
          title: '类别',
          dataIndex: 'costom',
          render: (costom) => (costom === 1) ? <Typography.Text type="warning">自定义</Typography.Text> : <Typography.Text type="success">系统</Typography.Text>,
        },
      ];

    const clearModal = () => {
        setVisible(false);
        setSelectKey(undefined);
    }
    // 选择
    const handleConfigSelect = () => {
        // 传递给父组件
        handleAddConfig(selectKey)
        // 关闭弹出框
        clearModal();
    }
    // 行选择框
    const rowSelection = {
        type: 'radio',
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectKey(Number(selectedRowKeys));
        },
        selectedRowKeys: [selectKey]
    };

    return (<Modal title={"配置选择"} open={visible} cancelText="取消" okText="确认"
                    onCancel={clearModal} onOk={handleConfigSelect} >
        <Table
            rowSelection={{...rowSelection}}
            rowKey="id"
            columns={columns}
            dataSource={loadDataSource()}
            pagination={false}
        />
    </Modal>)

}

// 组合项
const CombinationItem = ({combinationConfig, refreshView, handleCombinationConvert, systemConfigDataSource, configDataSource}) => {

    const [newCombinationConfig, setNewCombinationConfig] = React.useState({ ...combinationConfig, combination: [ ...combinationConfig.combination ] });
    const [visible, setVisible] = React.useState(false);
    const [frameVisible, setFrameVisible] = React.useState(false);
    const [frameIndex, setFrameIndex] = React.useState(false);

    const [combinationName, setCombinationNamesetName] = React.useState(newCombinationConfig.name);
    const [combinationDesc, setCombinationDesc] = React.useState(newCombinationConfig.description);

    if (!newCombinationConfig.combination) {
        return null;
    }

    // 待处理数据
    const configDataObj = convertConfigDataSource(systemConfigDataSource, configDataSource);
    const timelineItemList = newCombinationConfig.combination.map((id, index) => {
        const item = configDataObj[id];
        item.index = index;
        return item;
    });

    // 删除组合配置
    const handleDeleteCombinationConfig = (index) => {
        newCombinationConfig.combination.splice(index, 1);
        setNewCombinationConfig({ ...newCombinationConfig});

    }

    // 打开配置弹出框
    const openConfigTableModal = (index) => {
        setFrameIndex(index);
        setFrameVisible(true);
    } 

    // 添加配置
    const handleAddConfig = configId => {
        if (!frameVisible) {
            // 添加失败, 窗口未打开
            return;
        }
        
        const arr = [];
        for (let i = 0; i < newCombinationConfig.combination.length; i++) {
            arr.push(newCombinationConfig.combination[i]);
            if (i === frameIndex) {
                arr.push(configId);
            }
        }
        if (frameIndex === -1) {
            arr.push(configId);
        }
        newCombinationConfig.combination = arr;
    }

    // 删除组合
    const deleteCombination = () => {
        const result = JsonEditService.deleteCombination(newCombinationConfig.id);
        if (result === true) {
            message.success("删除成功");
            setVisible(false);
            refreshView();
            return;
        }
        message.success("删除失败, 原因是" + result);
    }
    // 保存组合
    const saveCombination = () => {
        if (!newCombinationConfig.combination || newCombinationConfig.combination.length === 0) {
            message.warn("请先维护节点");
            return;
        }
        if (!combinationName) {
            message.warn("请维护组合名称");
            return;
        }
        if (!combinationDesc) {
            message.warn("请维护组合作用");
            return;
        }
        const combinationObj = { ...newCombinationConfig, name: combinationName, 
            description: combinationDesc, combination: [ ...newCombinationConfig.combination ] };
        const result = JsonEditService.updateCombination(combinationObj);
        if (result === true) {
            message.success("保存成功");
            setVisible(false);
            refreshView();
            return;
        }
        message.success("保存失败, 原因是" + result);
    }


    return (<>
        <Tooltip style={{marginLeft: '15px'}} title={newCombinationConfig.description}><Button type="dashed" onClick={e => handleCombinationConvert(combinationConfig.combination)}>{combinationConfig.name}</Button></Tooltip>
        <Tooltip title="编辑"><Button shape="circle" type="text" onClick={e => setVisible(true)} icon={<EditOutlined />} size="small" /></Tooltip>
        <Modal open={visible} title='组合管理' onCancel={() => setVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setVisible(false)}>取消</Button>,
                    <Button key="delete" onClick={deleteCombination}>删除</Button>,
                    <Button key="confirm" type='primary' onClick={saveCombination}>保存</Button>
                ]}
            >
            <Input addonBefore={'组合名称'} value={combinationName} onChange={e => setCombinationNamesetName(e.target.value)}/>
            <Input style={{marginTop: '5px', marginBottom: '15px'}} addonBefore={'组合作用'} value={combinationDesc} onChange={e => setCombinationDesc(e.target.value)}/>
            
            <Timeline mode="left">
                {(timelineItemList.length === 0) && (
                    <Timeline.Item key={0} color="gray">
                        <Tooltip title="添加" ><Button shape="circle" type="text" icon={<PlusOutlined />} onClick={e => openConfigTableModal(-1)}></Button></Tooltip>
                    </Timeline.Item>
                )}
                {timelineItemList.map((item, index) => {
                    return (<Timeline.Item key={index} color={item.id > 0 ? '#faad14' : '#52c41a'}>
                        <Tooltip title="添加" ><Button shape="circle" type="text" icon={<PlusOutlined />} onClick={e => openConfigTableModal(index)}></Button></Tooltip>
                        <Tooltip title="删除" ><Button shape="circle" type="text" icon={<DeleteOutlined />} onClick={e => handleDeleteCombinationConfig(index)}></Button></Tooltip>
                        <Tooltip title={item.description} >{item.name}</Tooltip>
                    </Timeline.Item>)
                })}
            </Timeline>
        </Modal>
        
        <ConfigTableModal visible={frameVisible} setVisible={setFrameVisible} handleAddConfig={handleAddConfig}
                        systemConfigDataSource={systemConfigDataSource} configDataSource={configDataSource}/>
    </>);
}

// 默认组合名称
const defaultCombinationName = '自定义组合';
// 组合管理
const CombinationManager = ({refreshView}) => {

    const [visible, setVisible] = React.useState(false);
    const [combinationName, setCombinationName] = React.useState('');
    const [combinationDesc, setCombinationDesc] = React.useState('');

    // 添加组合
    const handleAddCombination = () => {
        const combinationObj = {};
        combinationObj.name = combinationName || defaultCombinationName;
        combinationObj.description = combinationDesc || combinationObj.name;
        combinationObj.combination = [];
        const result = JsonEditService.addCombination(combinationObj);
        if (result === true) {
            message.success("创建成功")
            refreshView();
            return;
        }
        message.warn("创建失败, 原因是" + result);
    }

    return (<>
        <Button type='link' onClick={e => setVisible(true)}>组合管理</Button>
        <Popconfirm icon={null} cancelText='取消' okText='新建'
            onConfirm={handleAddCombination} placement="right"
            title={<>
                <Typography.Title level={5}>新建组合</Typography.Title>
                <Input addonBefore={'组合名称'} placeholder={defaultCombinationName} value={combinationName} onChange={e => setCombinationName(e.target.value)} />
                <Input style={{marginTop: '3px'}} addonBefore={'组合作用'} placeholder={defaultCombinationName} value={combinationDesc} onChange={e => setCombinationDesc(e.target.value)} />
                </>} >
                <Button shape="circle" type="text" icon={<PlusOutlined />} size="small" />
        </Popconfirm>
        <Modal open={visible} title='组合管理' footer={null} 
               onCancel={e => setVisible(false)}>
            暂不支持
        </Modal>
    </>)
}

// 配置视图
const CustomConfigView = ({style, handleConvertData, handleCombinationConvert, systemConvertConfigDataSource}) => {
    const [changeConfig, setChangeConfig ] = React.useState(false);
    const refreshView = () => {
        setChangeConfig(!changeConfig);
    }
    const dataSource = JsonEditService.listAllConfig();
    if (!dataSource || dataSource.length === 0) {
        return (<Row style={style}><Col><ConfigManager dataSource={[]} refreshView={refreshView} /></Col></Row>);
    }

    const combinationConfig = JsonEditService.listAllCombination();

    return (<>
    <Row style={style}>
        <Col>
            <ConfigManager dataSource={dataSource} refreshView={refreshView} />
        </Col>
        <Col style={{marginLeft: '5px'}}>
            {dataSource.map(item => <ConfigItem key={item.id} config={item} refreshView={refreshView} handleConvertData={handleConvertData}/>)}
        </Col>
    </Row>
    <Row style={{marginTop: '10px'}}>
        <Col>
            <CombinationManager refreshView={refreshView} />
        </Col>
        <Col style={{marginLeft: '5px'}}>
            {combinationConfig.map(item => <CombinationItem key={item.id} combinationConfig={item} refreshView={refreshView}
                    systemConfigDataSource={systemConvertConfigDataSource} configDataSource={dataSource}  handleCombinationConvert={handleCombinationConvert} />)}
        </Col>
    </Row>
    </>);
}

export default CustomConfigView;

