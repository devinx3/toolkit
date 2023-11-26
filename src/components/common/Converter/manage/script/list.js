import React from 'react';
import { Button, Modal, Tooltip, List, Skeleton, Checkbox, Typography, Upload, message, Input, Spin } from 'antd';
import { DeleteOutlined, ImportOutlined, ExportOutlined, CopyOutlined } from '@ant-design/icons';
import storeEditService, { requestService } from '../../store/storeEditService';
import { dynamicConfig } from '../handler';
import FileUtil from '../../../../../utils/FileUtil'
import StrUtil from '../../../../../utils/StrUtil'
import dayjs from 'dayjs'
import jsonp from 'jsonp';

const { addConfig, queryConfigByName, updateConfig, batchDeleteConfig } = storeEditService;

// 鼠标移入后延时多少才显示 Tooltip，单位：秒
const tipMouseEnterDelay = 1;
// 配置报表
const CONFIG_VERSION = 101;
// 配置回调方法
const CONFIG_CALLBACK_NAME = '__devinx3_call_231125__';
const EXPORT_DATA_NAME = 'd';
const EXPORT_CONFIG_NAME = 'c';
// 从url中获取数据
const importFromUrl = (url, handleCallback) => {
    const handleError = (e, data) => {
        if (e instanceof Error) {
            handleCallback(e);
        } else {
            handleCallback(new Error(e));
        }
        message.error("加载失败: " + url)
        console.debug('加载失败', e);
    }
    jsonp(url,
        { name: CONFIG_CALLBACK_NAME, timeout: 30000 },
        (e, data) => {
            if (e) {
                handleError(e, data);
                return;
            }
            try {
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
            } catch (error) {
                handleError(error, data);
            }
        }
    );
}
// 是否由有效的 url 路径
const convertURL = (urlString) => {
    try {
        return new URL(urlString);
    } catch (e) {
        return false;
    }
}

const ExpandManageList = ({ lang, dataSource, refreshScript }) => {

    const [visible, setVisible] = React.useState(false);

    const [checkedList, setCheckedList] = React.useState([]);
    const [indeterminate, setIndeterminate] = React.useState(false);
    const [checkAllConfig, setCheckAllConfig] = React.useState(false);

    const [scriptVisible, setScriptVisible] = React.useState(false);
    const [scriptModalContent, setScriptModalContent] = React.useState();

    // 导出 URL 配置
    const [exportUrlVisible, setExportUrlVisible] = React.useState();
    const [coverByName, setCoverByName] = React.useState();;
    // 导入配置路径
    const [importConfigUrl, setImportConfigUrl] = React.useState();
    const [importing, setImporting] = React.useState(false);

    const handleChangeImportConfigUrl = (e) => {
        setImportConfigUrl(e.target.value?.trim());
    }

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
        setCheckedList(list);
        setIndeterminate(!!list.length && list.length < dataSource.length);
        setCheckAllConfig(list.length === dataSource.length);
    }
    // 获取被勾选的配置项
    const getCheckConfigItem = removeId => {
        const source = [];
        for (let config of dataSource) {
            if (checkedList.indexOf(config.id) !== -1) {
                const obj = { ...config };
                if (removeId) {
                    delete obj['id']
                }
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
                allList.push(item.id);
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
        requestService(batchDeleteConfig, lang, checkedList)
            .then(() => {
                message.success("删除成功")
                clearCheckAll();
                refreshScript()
            })
            .catch(reason => message.error("删除失败, 原因是: " + reason))
    }
    // 构造导出数据
    const handleExportData = (source, config) => {
        const data = dynamicConfig.convertExportData(JSON.stringify(source), CONFIG_VERSION);
        if (!config) {
            return data;
        }
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
    const handleDoubleExportUrlConfig = () => {
        clearTimeout(doubleExportTimer);
        setExportUrlVisible(true)
    }
    // 导出 URL 文件配置
    const handleExportUrlConfig = () => {
        clearTimeout(doubleExportTimer);
        doubleExportTimer = setTimeout(() => {
            clearTimeout(doubleExportTimer);
            const urlConfig = {};
            if (coverByName) {
                urlConfig.coverByName = 1;
            }
            handleExportConfig(urlConfig);
        }, 555);
    }
    // 导出配置
    const handleExportConfig = (config) => {
        if (checkedList.length === 0) {
            message.info("没有选中任何行, 无需导出")
            return;
        }
        const source = getCheckConfigItem(true);
        const exportData = handleExportData(source, config);
        const fileName = 'config' + dayjs().format('MMDDHHmmss');
        FileUtil.download(exportData, fileName);
    }

    // 复制JSON配置
    const handleCopyConfig = () => {
        if (checkedList.length === 0) {
            message.info("没有选中任何行, 无法复制")
            return;
        }
        const source = getCheckConfigItem(true);
        if (StrUtil.copyToClipboard(JSON.stringify(source))) {
            message.success("复制成功")
        }
    }
    // 导入浏览器中
    const handleImportConfigCallback = (importData, importConofig) => {
        if (!importData || importData instanceof Error) {
            setImporting(false);
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
                setImporting(false);
                return;
            }
        }
        if (!importConofig) {
            importConofig = {};
        }
        try {
            newList = JSON.parse(dynamicConfig.convertImportData(importData));
        } catch (e) {
            message.error("导入失败, 异常消息: " + e.message);
            setImporting(false);
            return;
        }
        if (!(newList && newList.length && newList.length > 0)) {
            setImporting(false);
            return;
        }
        let successCount = 0;
        let errorMsg = '';
        Promise.all(newList.map(async config => {
            if (importConofig.coverByName) {
                const dbList = await requestService(queryConfigByName, lang, config.name);
                if (dbList?.length === 1) {
                    // 更新数据
                    try {
                        console.debug("导入的数据:", dbList[0]);
                        config.id = dbList[0].id;
                        await requestService(updateConfig, lang, config);
                        return successCount++;
                    } catch (reason) {
                        return errorMsg = errorMsg + reason + ";";
                    }
                } else if (dbList?.length > 1) {
                    message.warn("匹配到多个【" + config.name + "】, 将会新增配置");
                }
            } else {
                config.name = config.name + '(by impory)';
            }
            try {
                await requestService(addConfig, lang, config);
                return successCount++;
            } catch (reason) {
                return errorMsg = errorMsg + reason + ";";
            }
        })).finally(() => {
            if (successCount === 0) {
                message.error("全部导入失败, 异常消息: ");
                return;
            }
            if (successCount === newList.length) {
                message.success("全部导入成功");
            } else {
                message.warn("部分导入成功, 异常个数" + (newList.length - successCount) + ", 异常消息: " + errorMsg);
            }
            setImporting(false);
            refreshScript();
        });
    }
    // 导入配置
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
            } else if (matchURL.protocol !== window.location.protocol) {
                message.warn("不支持的协议, 目前仅支持 【" + window.location.protocol + "】开头的导入地址");
                return false;
            }
            setImporting(true);
            importFromUrl(importConfigUrl, handleImportConfigCallback);
        } else {
            setImporting(true);
            FileUtil.readAsText(file, handleImportConfigCallback);
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
        <Button type='link' onClick={() => setVisible(true)}>配置管理</Button>
        <Modal title={"配置管理"} open={visible} footer={null} onCancel={() => setVisible(false)} >
            <List
                itemLayout="horizontal"
                dataSource={dataSource}
                rowKey='id'
                header={(<Spin spinning={importing}>
                    <Checkbox indeterminate={indeterminate}
                        disabled={dataSource.length === 0}
                        checked={checkAllConfig}
                        onChange={onCheckAllChangeConfigItem}>
                        全选
                    </Checkbox>
                    <Button type='text' disabled={dataSource.length === 0} icon={<DeleteOutlined />} onClick={handleDeleteConfig}>删除</Button>
                    <Button type='text' disabled={dataSource.length === 0} icon={<ExportOutlined />}
                         onClick={handleExportUrlConfig} onDoubleClick={handleDoubleExportUrlConfig}>导出</Button>
                    <Tooltip title="不支持导入" mouseEnterDelay={tipMouseEnterDelay * 2}>
                        <Button type='text' disabled={dataSource.length === 0} icon={<CopyOutlined />} onClick={handleCopyConfig}>复制JSON配置</Button>
                    </Tooltip>
                </Spin>)}
                footer={<Spin spinning={importing}><Input type='url' placeholder='配置导入文件地址' value={importConfigUrl} onChange={handleChangeImportConfigUrl} allowClear/>
                    {importConfigUrl?.length > 0 ? (<Button onClick={handleImportConfig} icon={<ImportOutlined />}>导入</Button>) : (<Upload maxCount={1} beforeUpload={(file) => handleImportConfig(file)} >
                        <Button icon={<ImportOutlined />}>导入</Button>
                    </Upload>)
                    }
                </Spin>}
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
            <div style={{ whiteSpace: 'pre-wrap' }}><Typography.Paragraph code copyable>{scriptModalContent}</Typography.Paragraph></div>
        </Modal>
        <Modal title="导出 URL 文件配置" open={exportUrlVisible} width="20%" footer={null} onCancel={() => setExportUrlVisible(false)} >
            <Checkbox checked={coverByName} onChange={e => setCoverByName(e.target.checked)} on >同名覆盖</Checkbox>
        </Modal>
    </>)
}

export default ExpandManageList;
