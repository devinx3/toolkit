import React from 'react';
import { Button, Modal, Tooltip, List, Skeleton, Checkbox, Typography, Upload, message, Input, Spin, Drawer, Space } from 'antd';
import { DeleteOutlined, ImportOutlined, ExportOutlined, CopyOutlined, EyeOutlined, EyeInvisibleOutlined, CloseOutlined } from '@ant-design/icons';
import storeEditService, { requestService } from '../../store/storeEditService';
import { ScriptUtil } from '../handler';
import { backup2ImportData, restoreByImportData } from '../backup';
import CopyButton from '../../../CopyButton';
import FileUtil from '../../../../../utils/FileUtil'
import StrUtil from '../../../../../utils/StrUtil'
import GlobalUtil from '../../../../../utils/GlobalUtil'
import dayjs from 'dayjs'
import axios from 'axios';

const { addConfig, queryConfigByCode, updateConfig, hiddenConfig, batchDeleteConfig } = storeEditService;

// 鼠标移入后延时多少才显示 Tooltip，单位：秒
const tipMouseEnterDelay = 1;

(() => {
    // 2025-06-01 删除此函数
    // 配置回调方法
    const CONFIG_CALLBACK_NAME = '__devinx3_call_231125__';
    window[CONFIG_CALLBACK_NAME] = (obj) => {
        let result = JSON.stringify(obj);
        return {
            remark: "转换成新版本的导入数据(2025-06-01 删除此函数)",
            result,
            download: () => {
                FileUtil.download(result, 'download-v2.txt')
            }
        }
    }
})();
// 密钥
const SECRET_KEY_NAME = 'secretKey';
// 从url中获取数据
const importFromUrl = (url, secretKey, handleCallback, handleClear) => {
    axios.get(url, { responseType: 'text' })
        .then(function (res) {
            handleCallback(res.data, secretKey);
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

const ExpandManageList = ({ category, intelligent, dataSource, refreshScript }) => {

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
        const _secretKey = GlobalUtil.getSearchParams(url).get(SECRET_KEY_NAME)?.trim();
        setSecretKey(_secretKey || '');
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
    const handleBackupData = (source, config) => {
        return backup2ImportData(source, { secretKey, ...config });
    }
    let doubleBackupTimer = null;
    // 备份 URL 文件节点
    const handleBackupUrlConfig = () => {
        clearTimeout(doubleBackupTimer);
        doubleBackupTimer = setTimeout(() => {
            clearTimeout(doubleBackupTimer);
            handleBackupConfig({});
        }, 555);
    }
    // 备份节点
    const handleBackupConfig = (config) => {
        if (checkedList.length === 0) {
            message.info("没有选中任何行, 无需导出")
            return;
        }
        const source = getCheckConfigItem();
        const backupData = handleBackupData(source, config);
        const fileName = 'config-' + category + "-" + dayjs().format('MMDDHHmmss');
        FileUtil.download(backupData, fileName);
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
    const startImport = (callback) => setImporting(true) & setTimeout(callback, 0);
    const completeImport = () => setImporting(false);
    const handleImportConfigCallback = (importData, configSecretKey) => {
        if (!importData) {
            completeImport();
            return;
        }
        debugger
        let newList = null;
        try {
            newList = restoreByImportData(importData, configSecretKey || secretKey);
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
                config.name = config.name + (config.code ? '' : '(by import)');
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
    const handleImportConfig = (file, customUrl, customSecretKey) => {
        if (importing) {
            message.warn("正在导入中, 请等待");
            return false;
        }
        const newImportConfigUrl = customUrl?.length ? customUrl : importConfigUrl;
        if (newImportConfigUrl?.length > 0) {
            const matchURL = convertURL(newImportConfigUrl);
            if (!matchURL) {
                message.error("无效的导入地址");
                return false;
            }
            startImport(() => importFromUrl(newImportConfigUrl, customSecretKey, handleImportConfigCallback, completeImport));
        } else {
            startImport(() => FileUtil.readAsText({
                file,
                handleRead: handleImportConfigCallback,
                handleError: completeImport
            }));
        }
        return false;
    }
    if (intelligent.getImportUrl()) {
        let url = intelligent.getImportUrl();
        const secretKey = GlobalUtil.getSearchParams(url).get(SECRET_KEY_NAME)?.trim();
        intelligent.clearImport();
        handleImportConfig(null, url, secretKey)
    }
    const handleGenerageBackupLink = () => {
        if (!(importConfigUrl?.length > 0)) {
            message.warning("请输入备份文件地址");
            return;
        }
        const idx = window.location.href.indexOf("?");
        let newUrl = (idx === -1 ? window.location.href : window.location.href.substring(0, idx));
        newUrl = newUrl + "?importUrl=" + window.encodeURIComponent(importConfigUrl);
        StrUtil.copyToClipboard(newUrl);
        message.success("已复制到粘贴板");
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
            <Spin spinning={importing}>
                <List
                    itemLayout="horizontal"
                    dataSource={dataSource}
                    rowKey='code'
                    header={(<>
                        <Checkbox indeterminate={indeterminate}
                            disabled={dataSource.length === 0}
                            checked={checkAllConfig}
                            onChange={onCheckAllChangeConfigItem}>
                            全选
                        </Checkbox>
                        <Button type='text' disabled={checkedList.length === 0} icon={<DeleteOutlined />} onClick={handleDeleteConfig}>删除</Button>
                        <Button type='text' disabled={checkedList.length === 0} icon={<ExportOutlined />}
                            onClick={handleBackupUrlConfig}>备份</Button>
                        <Button type='text' disabled={checkedList.length === 0} onClick={() => hanldeHidden(true)} icon={<EyeInvisibleOutlined />}>隐藏</Button>
                        <Button type='text' disabled={checkedList.length === 0} onClick={() => hanldeHidden(false)} icon={<EyeOutlined />}>显示</Button>
                        <Tooltip title="不支持导入" mouseEnterDelay={tipMouseEnterDelay * 2}>
                            <Button type='text' disabled={checkedList.length === 0} icon={<CopyOutlined />} onClick={handleCopyConfig}>复制JSON节点</Button>
                        </Tooltip>
                    </>)}
                    footer={<>
                        <Input style={{ marginTop: "3px" }} type='url' placeholder='备份文件地址' value={importConfigUrl} onChange={handleChangeImportConfigUrl} allowClear />
                        <Input style={{ marginTop: "3px" }} type='text' disabled={importConfigUrl?.length > 0} addonBefore={`${SECRET_KEY_NAME}=`} placeholder='密钥' value={secretKey} onChange={(e) => setSecretKey(e.target.value)} allowClear />
                        <Space style={{ marginTop: "3px" }}>
                            {importConfigUrl?.length > 0 ? (<Button onClick={handleImportConfig} icon={<ImportOutlined />}>导入</Button>) : (<Upload maxCount={1} showUploadList={false} beforeUpload={(file) => handleImportConfig(file)} >
                                <Button icon={<ImportOutlined />}>导入</Button>
                            </Upload>)}
                            <Button onClick={handleGenerageBackupLink}>生成导入链接</Button>
                        </Space>
                    </>}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                <CopyButton type='link' tipTitle="复制节点编码" onClick={() => StrUtil.copyToClipboard(item.code)} ></CopyButton>,
                                <Button type='link' key="list-item-srcipt" onClick={() => handleOpenScriptContentModal(item.scriptContent)}>脚本</Button>
                            ]} >
                            <Skeleton loading={false}>
                                <List.Item.Meta
                                    avatar={<Checkbox value={item.code} checked={checkedList.indexOf(item.code) >= 0} onChange={onChangeConfigItem} />}
                                    title={(<>{item.hidden ? <EyeInvisibleOutlined /> : <EyeOutlined />}<Typography.Text title={item.code} style={{ marginLeft: "3px" }}><b>{item.name}</b></Typography.Text></>)}
                                    description={item.description}
                                />
                            </Skeleton>
                        </List.Item>
                    )}
                />
            </Spin>
        </Drawer>
        <Modal title="脚本内容" open={scriptVisible} width="60%" footer={null} onCancel={handleCloseScriptContentModal} >
            <div style={{ whiteSpace: 'pre-wrap' }}><Typography.Paragraph code copyable>{scriptModalContent}</Typography.Paragraph></div>
        </Modal>
    </>)
}

export default ExpandManageList;
