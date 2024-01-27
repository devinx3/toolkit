import React from 'react';
import { Button, Modal, Tooltip, List, Skeleton, Checkbox, Typography, Upload, message, Input, Spin, Drawer, Space } from 'antd';
import { DeleteOutlined, ImportOutlined, ExportOutlined, CopyOutlined, EyeOutlined, EyeInvisibleOutlined, CloseOutlined } from '@ant-design/icons';
import storeEditService, { requestService } from '../../store/storeEditService';
import { ScriptUtil, dynamicConfig, SIMPLE_SECRET_STRATEGY } from '../handler';
import FileUtil from '../../../../../utils/FileUtil'
import StrUtil from '../../../../../utils/StrUtil'
import GlobalUtil from '../../../../../utils/GlobalUtil'
import dayjs from 'dayjs'
import jsonp from '../../../../../utils/jsonp'

const { addConfig, queryConfigByCode, updateConfig, hiddenConfig, batchDeleteConfig } = storeEditService;

// 鼠标移入后延时多少才显示 Tooltip，单位：秒
const tipMouseEnterDelay = 1;
// 配置报表
const CONFIG_VERSION = 101;
// 配置回调方法
const CONFIG_CALLBACK_NAME = '__devinx3_call_231125__';
const EXPORT_DATA_NAME = 'd';
const EXPORT_CONFIG_NAME = 'c';
const EXPORT_SECRET_STRATEGY_NAME = 'ss';
// 密钥
const SECRET_KEY_NAME = 'secretKey';
// 从url中获取数据
const importFromUrl = (url, handleCallback, handleClear) => {
    jsonp(url, {
        name: CONFIG_CALLBACK_NAME,
        timeout: 30000
    }).then(function (data) {
        if (!data) {
            throw new Error("数据格式异常");
        }
        const scriptContent = data[EXPORT_DATA_NAME];
        if (!(typeof (scriptContent) === 'string')) {
            throw new Error("数据格式异常");
        }
        const itemConfig = data[EXPORT_CONFIG_NAME];
        if (itemConfig && !(typeof (itemConfig) === 'object')) {
            throw new Error("数据格式异常");
        }
        handleCallback(scriptContent, itemConfig);
    }).catch(e => {
        handleClear();
        message.error("加载失败: " + url)
        console.debug('加载失败', e)
    }).finally(() => handleClear(undefined))
}
// 是否由有效的 url 路径
const convertURL = (urlString) => {
    try {
        return new URL(urlString);
    } catch (e) {
        return false;
    }
}

const ExpandManageList = ({ category, dataSource, refreshScript }) => {

    const [visible, setVisible] = React.useState(false);

    const [checkedList, setCheckedList] = React.useState([]);
    const [indeterminate, setIndeterminate] = React.useState(false);
    const [checkAllConfig, setCheckAllConfig] = React.useState(false);

    const [scriptVisible, setScriptVisible] = React.useState(false);
    const [scriptModalContent, setScriptModalContent] = React.useState();

    // 密钥
    const [secretKey, setSecretKey] = React.useState('');
    // 导入配置路径
    const [importConfigUrl, setImportConfigUrl] = React.useState();
    const [importing, setImporting] = React.useState(false);

    const handleChangeImportConfigUrl = (e) => {
        const url = e.target.value?.trim();
        setImportConfigUrl(url);
        const secretKey = GlobalUtil.getSearchParams(url).get(SECRET_KEY_NAME)?.trim();
        if (secretKey) setSecretKey(secretKey);
    }

    // 列表页勾选项
    const onChangeConfigItem = (e) => {
        const code = e.target.value;
        const list = [...checkedList];
        const index = list.indexOf(code);
        if (e.target.checked) {
            if (index < 0) {
                list.push(code);
            }
        } else {
            if (index >= 0) {
                list.splice(index, 1);
            }
        }
        setCheckedList(list);
        setIndeterminate(!!list.length && list.length < dataSource.length);
        setCheckAllConfig(list.length === dataSource.length);
    }
    // 获取被勾选的节点项
    const getCheckConfigItem = () => {
        const source = [];
        for (let config of dataSource) {
            if (checkedList.indexOf(config.code) !== -1) {
                const obj = { ...config };
                source.push(obj);
            }
        }
        return source;
    }
    // 全部勾选页
    const onCheckAllChangeConfigItem = (e) => {
        if (e.target.checked) {
            const allList = [];
            for (let item of dataSource) {
                allList.push(item.code);
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
    // 删除节点
    const handleDeleteConfig = () => {
        if (checkedList.length === 0) {
            message.info("没有选中任何行, 无需删除")
            return;
        }
        requestService(batchDeleteConfig, category, checkedList)
            .then(() => {
                message.success("删除成功")
                clearCheckAll();
                refreshScript()
            })
            .catch(reason => message.error("删除失败, 原因是: " + reason))
    }
    // 构造导出数据
    const handleExportData = (source, config) => {
        const secretStrategy = secretKey ? SIMPLE_SECRET_STRATEGY : undefined;
        const data = dynamicConfig.convertExportData(JSON.stringify(source), CONFIG_VERSION, secretStrategy, secretKey);
        if (!config) {
            return data;
        }
        if (secretStrategy) config[EXPORT_SECRET_STRATEGY_NAME] = secretStrategy;
        let exportData = CONFIG_CALLBACK_NAME;
        exportData = exportData + '({'
        exportData = exportData + `${EXPORT_DATA_NAME}:"${data}"`
        if (config instanceof Object && Object.keys(config).length > 0) {
            exportData = exportData + `,${EXPORT_CONFIG_NAME}:${JSON.stringify(config)}`
        }
        exportData = exportData + '})';
        return exportData;
    }
    let doubleExportTimer = null;
    // 导出 URL 文件节点
    const handleExportUrlConfig = () => {
        clearTimeout(doubleExportTimer);
        doubleExportTimer = setTimeout(() => {
            clearTimeout(doubleExportTimer);
            handleExportConfig({});
        }, 555);
    }
    // 导出节点
    const handleExportConfig = (config) => {
        if (checkedList.length === 0) {
            message.info("没有选中任何行, 无需导出")
            return;
        }
        const source = getCheckConfigItem();
        const exportData = handleExportData(source, config);
        const fileName = 'config-' + category + "-" + dayjs().format('MMDDHHmmss');
        FileUtil.download(exportData, fileName);
    }
    const hanldeHidden = (checkedScriptHidden) => {
        requestService(hiddenConfig, category, checkedList, checkedScriptHidden)
        .then(() => {
            message.success("隐藏成功")
            clearCheckAll();
            refreshScript()
        }).catch(err => message.error("隐藏失败"));
    }

    // 复制JSON节点
    const handleCopyConfig = () => {
        if (checkedList.length === 0) {
            message.info("没有选中任何行, 无法复制")
            return;
        }
        const source = getCheckConfigItem();
        if (StrUtil.copyToClipboard(JSON.stringify(source))) {
            message.success("复制成功")
        }
    }
    // 导入浏览器中
    const startImport = () => setImporting(false);
    const completeImport = () => setImporting(false);
    const handleImportConfigCallback = (importData, importConofig) => {
        if (!importData) {
            completeImport();
            return;
        }
        let newList = null;
        if (importData?.startsWith(CONFIG_CALLBACK_NAME)) {
            const Fun = Function;
            const importContextName = 'importContext';
            const importContext = {}
            importContext[CONFIG_CALLBACK_NAME] = obj => {
                importData = obj[EXPORT_DATA_NAME];
                importConofig = obj[EXPORT_CONFIG_NAME];
            }
            try {
                const execFun = new Fun(importContextName, importContextName + '.' + importData);
                execFun(importContext);
            } catch (e) {
                message.error("导入失败, 异常消息: " + e.message);
                completeImport();
                return;
            }
        }
        if (!importConofig) {
            importConofig = {};
        }
        try {
            newList = JSON.parse(dynamicConfig.convertImportData(importData, importConofig[EXPORT_SECRET_STRATEGY_NAME], secretKey));
        } catch (e) {
            message.error("导入失败, 异常消息: " + e.message);
            completeImport();
            return;
        }
        if (!(newList && newList.length && newList.length > 0)) {
            completeImport();
            return;
        }
        let successCount = 0;
        let errorMsg = '';
        Promise.all(newList.map(async config => {
            const dbList = queryConfigByCode(category, config.code);
            if (dbList?.length === 1) {
                // 更新数据
                try {
                    console.debug("导入的数据:", dbList[0]);
                    if (ScriptUtil.canUpdate(dbList[0].version, config.version)) {
                        updateConfig(category, config, true)
                    }
                    return successCount++;
                } catch (reason) {
                    return errorMsg = errorMsg + reason + ";";
                }
            } else if (dbList?.length > 1) {
                return "导入失败: 存在多个相同的编码: " + config.code + ";";
            } else {
                config.name = config.name + config.code ? '' : '(by import)';
            }
            try {
                addConfig(category, config, true)
                return successCount++;
            } catch (reason) {
                return errorMsg = errorMsg + reason + ";";
            }
        })).finally(() => {
            if (successCount === 0) {
                message.error("全部导入失败, 异常消息: " + errorMsg);
                return;
            }
            if (successCount === newList.length) {
                message.success("全部导入成功");
            } else {
                message.warn("部分导入成功, 异常个数" + (newList.length - successCount) + ", 异常消息: " + errorMsg);
            }
            completeImport();
            refreshScript();
        });
    }
    // 导入节点
    const handleImportConfig = (file) => {
        if (importing) {
            message.warn("正在导入中, 请等待");
            return false;
        }
        if (importConfigUrl?.length > 0) {
            const matchURL = convertURL(importConfigUrl);
            if (!matchURL) {
                message.error("无效的导入地址");
                return false;
            }
            startImport();
            importFromUrl(importConfigUrl, handleImportConfigCallback, completeImport);
        } else {
            startImport();
            FileUtil.readAsText({
                file,
                handleRead: handleImportConfigCallback,
                handleError: completeImport
            });
        }
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
        <Button type='link' style={{ marginTop: '5px' }} onClick={() => setVisible(true)}>脚本节点</Button>
        <Drawer title={"脚本节点"} open={visible} placement={"left"} footer={null} onClose={() => setVisible(false)}
            closeIcon={null} extra={<CloseOutlined className='ant-drawer-close' onClick={() => setVisible(false)}></CloseOutlined>}>
            <List
                itemLayout="horizontal"
                dataSource={dataSource}
                rowKey='code'
                header={(<Spin spinning={importing}>
                    <Checkbox indeterminate={indeterminate}
                        disabled={dataSource.length === 0}
                        checked={checkAllConfig}
                        onChange={onCheckAllChangeConfigItem}>
                        全选
                    </Checkbox>
                    <Button type='text' disabled={checkedList.length === 0} icon={<DeleteOutlined />} onClick={handleDeleteConfig}>删除</Button>
                    <Button type='text' disabled={checkedList.length === 0} icon={<ExportOutlined />}
                         onClick={handleExportUrlConfig}>导出</Button>
                    <Button type='text' disabled={checkedList.length === 0} onClick={() => hanldeHidden(true)} icon={<EyeInvisibleOutlined />}>隐藏</Button>
                    <Button type='text' disabled={checkedList.length === 0} onClick={() => hanldeHidden(false)} icon={<EyeOutlined />}>显示</Button>
                    <Tooltip title="不支持导入" mouseEnterDelay={tipMouseEnterDelay * 2}>
                        <Button type='text' disabled={checkedList.length === 0} icon={<CopyOutlined />} onClick={handleCopyConfig}>复制JSON节点</Button>    
                    </Tooltip>

                </Spin>)}
                footer={<Spin spinning={importing}>
                    <Input style={{marginTop: "3px"}} type='url' placeholder='导入文件地址' value={importConfigUrl} onChange={handleChangeImportConfigUrl} allowClear />
                    <Input style={{marginTop: "3px"}} type='text' addonBefore={`${SECRET_KEY_NAME}=`} placeholder='密钥' value={secretKey} onChange={(e) => setSecretKey(e.target.value)} allowClear />
                    <Space style={{marginTop: "3px"}}>
                        {importConfigUrl?.length > 0 ? (<Button onClick={handleImportConfig} icon={<ImportOutlined />}>导入</Button>) : (<Upload maxCount={1} beforeUpload={(file) => handleImportConfig(file)} >
                            <Button icon={<ImportOutlined />}>导入</Button>
                        </Upload>)}
                    </Space>
                </Spin>}
                renderItem={(item) => (
                    <List.Item
                        actions={[<Button type='link' key="list-item-srcipt" onClick={() => handleOpenScriptContentModal(item.scriptContent)}>脚本</Button>]}
                    >
                        <Skeleton loading={false}>
                            <List.Item.Meta
                                avatar={<Checkbox value={item.code} checked={checkedList.indexOf(item.code) >= 0} onChange={onChangeConfigItem} />}
                                title={(<>{ item.hidden ? <EyeInvisibleOutlined /> : <EyeOutlined  />}<Typography.Text title={item.code} style={{marginLeft: "3px"}}><b>{item.name}</b></Typography.Text></>)}
                                description={item.description}
                            />
                        </Skeleton>
                    </List.Item>
                )}
            />
        </Drawer>
        <Modal title="脚本内容" open={scriptVisible} width="60%" footer={null} onCancel={handleCloseScriptContentModal} >
            <div style={{ whiteSpace: 'pre-wrap' }}><Typography.Paragraph code copyable>{scriptModalContent}</Typography.Paragraph></div>
        </Modal>
    </>)
}

export default ExpandManageList;
