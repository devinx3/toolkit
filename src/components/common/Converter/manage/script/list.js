import React from 'react';
import { Button, Modal, Tooltip, List, Skeleton, Checkbox, Typography, Upload, message } from 'antd';
import { DeleteOutlined, ImportOutlined, ExportOutlined, CopyOutlined } from '@ant-design/icons';
import storeEditService, { requestService } from '../../store/storeEditService';
import { dynamicConfig } from '../handler';
import FileUtil from '../../../../../utils/FileUtil'
import StrUtil from '../../../../../utils/StrUtil'
import dayjs from 'dayjs'

const { addConfig, batchDeleteConfig } = storeEditService;

// 配置报表
const CONFIG_VERSION = 101;

const ExpandManageList = ({ lang, dataSource, refreshScript }) => {

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
        const exportData = dynamicConfig.convertExportData(JSON.stringify(dataSource), CONFIG_VERSION);
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
    const handleImportConfig = (file) => {
        FileUtil.readAsText(file, content => {
            let newList = null;
            try {
                newList = JSON.parse(dynamicConfig.convertImportData(content));
            } catch (e) {
                message.error("导入失败, 异常消息: " + e.message);
                return;
            }
            if (!(newList && newList.length && newList.length > 0)) {
                return;
            }
            let successCount = 0;
            let errorMsg = '';
            Promise.all(newList.map(async config => {
                config.name = config.name + '(by impory)';
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
                refreshScript();
            })
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
                header={(<>
                    <Checkbox indeterminate={indeterminate}
                        disabled={dataSource.length === 0}
                        checked={checkAllConfig}
                        onChange={onCheckAllChangeConfigItem}>
                        全选
                    </Checkbox>
                    <Button type='text' disabled={dataSource.length === 0} icon={<DeleteOutlined />} onClick={handleDeleteConfig}>删除</Button>
                    <Button type='text' disabled={dataSource.length === 0} icon={<ExportOutlined />} onClick={handleExportConfig}>导出</Button>
                    <Tooltip title="不支持导入">
                        <Button type='text' disabled={dataSource.length === 0} icon={<CopyOutlined />} onClick={handleCopyConfig}>复制JSON配置</Button>
                    </Tooltip>
                </>)}
                footer={<Upload maxCount={1} beforeUpload={(file) => handleImportConfig(file)} >
                    <Button icon={<ImportOutlined />}>导入</Button>
                </Upload>}
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
    </>)
}

export default ExpandManageList;