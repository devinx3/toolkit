import React from 'react';
import { Button, Input, Modal, Drawer, Tooltip, Typography, Timeline, Table, Popconfirm, Row, Col, Space, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

import storeEditService, { requestService } from '../../store/storeEditService';
import { ScriptUtil } from '../handler';

const { addCombination, updateCombination, deleteCombination } = storeEditService;
const { Text } = Typography;

// 鼠标移入后延时多少才显示 Tooltip，单位：秒
const tipMouseEnterDelay = 1;

// 默认编排名称
const defaultCombinationName = '自定义编排';

// 新增编排
export const ExpandAddButton = ({ category, combinationConfig, refreshManage }) => {
    const [combinationName, setCombinationName] = React.useState();
    const [combinationDesc, setCombinationDesc] = React.useState();

    combinationConfig.name = combinationConfig.name || defaultCombinationName;
    combinationConfig.description = combinationConfig.description || combinationConfig.name;
    // 添加编排
    const handleAddCombination = () => {
        const item = {};
        item.name = combinationName || defaultCombinationName;
        item.description = combinationDesc || item.name;
        item.combination = [];

        requestService(addCombination, category, item)
            .then(() => {
                message.success("创建成功")
                refreshManage();
            }).catch(reason => message.warn("创建失败, 原因是" + reason))
    }
    return <Popconfirm icon={null} cancelText='取消' okText='新建'
        onConfirm={handleAddCombination} placement="right"
        title={<>
            <Typography.Title level={5}>新建编排</Typography.Title>
            <Input addonBefore={'编排名称'} placeholder={combinationConfig.name} value={combinationName} onChange={e => setCombinationName(e.target.value)} />
            <Input style={{ marginTop: '3px' }} addonBefore={'编排作用'} placeholder={combinationConfig.description} value={combinationDesc} onChange={e => setCombinationDesc(e.target.value)} />
        </>} >
        <Button style={{ marginLeft: '10px' }} shape="circle" type="text" icon={<PlusOutlined />} size="small" />
    </Popconfirm>
}

// 将list转换成对象
const convertConfigDataSource = (list) => {
    const data = {};
    for (let item of list) {
        data[item.code] = { ...item };
    }
    return data;
}


// 节点表格弹出框
const ConfigTableModal = ({ visible, setVisible, handleAddConfig, configDataSource }) => {
    const [selectKey, setSelectKey] = React.useState();
    // 加载数据源
    const loadDataSource = () => {
        const arr = [];
        for (let config of configDataSource) {
            arr.push({ code: config.code, name: config.name, description: config.description, costom: ScriptUtil.isBasic(config) ? 0 : 1 });
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
            setSelectKey(selectedRowKeys[0]);
        },
        selectedRowKeys: [selectKey]
    };

    return (<Modal title="节点选择" open={visible} cancelText="取消" okText="确认"
        onCancel={clearModal} onOk={handleConfigSelect} >
        <Table
            rowSelection={{ ...rowSelection }}
            rowKey="code"
            columns={columns}
            dataSource={loadDataSource()}
            pagination={false}
        />
    </Modal>)
}


// 扩展按钮
export const ExpandManageButton = ({ category, combinationConfig, refreshManage, handleConvert, configDataSource }) => {
    const [visible, setVisible] = React.useState(false);
    const [frameVisible, setFrameVisible] = React.useState(false);
    const [frameIndex, setFrameIndex] = React.useState(false);

    const [combinationName, setCombinationName] = React.useState(combinationConfig.name);
    const [combinationDesc, setCombinationDesc] = React.useState(combinationConfig.description);
    const [combinationConfigCodeList, setCombinationConfigCodeList] = React.useState([...combinationConfig.combination]);

    // 待处理数据
    const configDataObj = convertConfigDataSource(configDataSource);
    const timelineItemList = combinationConfigCodeList.map((code, index) => {
        const item = configDataObj[code] || {};
        item.index = index;
        return item;
    });

    // 重置编排
    const handleReset = () => {
        setCombinationName(combinationConfig.name)
        setCombinationDesc(combinationConfig.description)
        setCombinationConfigCodeList([...combinationConfig.combination])
    }
    // 取消编排
    const handleCancel = () => {
        setVisible(false);
    }
    // 添加节点
    const handleAddConfig = configCode => {
        if (!frameVisible) {
            // 添加失败, 窗口未打开
            return;
        }

        const arr = [];
        for (let i = 0; i < combinationConfigCodeList.length; i++) {
            arr.push(combinationConfigCodeList[i]);
            if (i === frameIndex) {
                arr.push(configCode);
            }
        }
        if (frameIndex === -1) {
            arr.push(configCode);
        }
        setCombinationConfigCodeList(arr)
    }
    // 删除编排
    const handleDelete = () => {
        requestService(deleteCombination, category, combinationConfig.code)
            .then(() => {
                message.success("删除成功");
                setVisible(false);
                refreshManage();
            }).catch(reason => message.success("删除失败, 原因是" + reason))
    }
    // 保存编排
    const handleSave = () => {
        if (combinationConfigCodeList.length === 0) {
            message.warn("请先维护节点");
            return;
        }
        if (!combinationName) {
            message.warn("请维编排名称");
            return;
        }
        for (const configCode of combinationConfigCodeList) {
            if (ScriptUtil.isBasic(configCode)) {
                continue;
            }
            if (!storeEditService.queryConfigByCode(category, configCode)) {
                message.warn("脚本节点不存在, 请刷新页面");
                return
            }
        }
        const item = {
            code: combinationConfig.code,
            name: combinationName,
            description: combinationDesc || combinationName,
            combination: combinationConfigCodeList
        };
        requestService(updateCombination, category, item)
            .then(() => {
                message.success("保存成功");
                setVisible(false);
                refreshManage();
            }).catch(reason => message.error("保存失败, 原因是: " + reason));
    }
    // 删除b编排
    const handleDeleteCombinationConfig = (index) => {
        combinationConfigCodeList.splice(index, 1);
        setCombinationConfigCodeList([...combinationConfigCodeList]);
    }
    // 编排数据是否发生变化
    const combinationConfigChangeFlag = () => {
        if (combinationConfigCodeList.length !== combinationConfig.combination.length) {
            return true;
        }
        for (let i = 0; i++; i <= combinationConfigCodeList.length) {
            if (combinationConfigCodeList[i] !== combinationConfig.combination[i]) {
                return true;
            }
        }
        return combinationName !== combinationConfig.name || combinationDesc !== combinationConfig.description;
    }
    // 打节点弹出框
    const openConfigTableModal = (index) => {
        setFrameIndex(index);
        setFrameVisible(true);
    }

    return (<>
        <Tooltip style={{ marginLeft: '15px' }} title={combinationConfig.description} mouseEnterDelay={tipMouseEnterDelay}>
            <Button type="dashed" onClick={e => handleConvert(combinationConfig, combinationConfig.combination)}>{combinationConfig.name}</Button>
        </Tooltip>
        <Tooltip title="编辑" mouseEnterDelay={tipMouseEnterDelay * 2}>
            <Button shape="circle" type="text" onClick={e => setVisible(true)} icon={<EditOutlined />} size="small" />
        </Tooltip>

        <Drawer open={visible} onCancel={handleCancel}
            title={combinationConfigChangeFlag() ? <Text style={{ color: "#1890ff" }} strong >编辑编排 *</Text> : <Text>编辑编排</Text>}
            onClose={handleCancel}
            footer={<Row justify="end">
                <Space>
                    <Col><Button key="reset" onClick={handleReset}>重置</Button></Col>
                    <Col><Button key="delete" onClick={handleDelete}>删除编排</Button></Col>
                    <Col><Button type='primary' onClick={handleSave}>保存编排</Button></Col>
                </Space>
            </Row>}
        >
            <Input addonBefore={'编排名称'} value={combinationName} onChange={e => setCombinationName(e.target.value)} />
            <Input style={{ marginTop: '5px', marginBottom: '15px' }} addonBefore={'编排作用'} value={combinationDesc} onChange={e => setCombinationDesc(e.target.value)} />

            <Timeline mode="left">
                {(timelineItemList.length === 0) && (
                    <Timeline.Item key={0} color="gray">
                        <Tooltip title="添加" mouseEnterDelay={tipMouseEnterDelay * 2} ><Button shape="circle" type="text" icon={<PlusOutlined />} onClick={e => openConfigTableModal(-1)}></Button></Tooltip>
                    </Timeline.Item>
                )}
                {timelineItemList.map((item, index) => {
                    return (<Timeline.Item key={index} color={ScriptUtil.isBasic(item) ? '#52c41a' : '#faad14'}>
                        <Tooltip title="添加" mouseEnterDelay={tipMouseEnterDelay * 2}><Button shape="circle" type="text" icon={<PlusOutlined />} onClick={e => openConfigTableModal(index)}></Button></Tooltip>
                        <Tooltip title="删除" mouseEnterDelay={tipMouseEnterDelay * 2}><Button shape="circle" type="text" icon={<DeleteOutlined />} onClick={e => handleDeleteCombinationConfig(index)}></Button></Tooltip>
                        <Tooltip title={item.description} mouseEnterDelay={tipMouseEnterDelay}>{item.name}</Tooltip>
                    </Timeline.Item>)
                })}
            </Timeline>
        </Drawer>

        <ConfigTableModal visible={frameVisible} setVisible={setFrameVisible} handleAddConfig={handleAddConfig} configDataSource={configDataSource} />
    </>);
}