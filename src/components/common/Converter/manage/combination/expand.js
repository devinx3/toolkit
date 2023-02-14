import React from 'react';
import { Button, Input, Modal, Drawer, Tooltip, Typography, Timeline, Table, Popconfirm, Row, Col, Space, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

import storeEditService, { requestService } from '../../store/storeEditService';
import { ScriptUtil } from '../handler';

const { addCombination, updateCombination, deleteCombination } = storeEditService;
const { Text } = Typography;

// 鼠标移入后延时多少才显示 Tooltip，单位：秒
const tipMouseEnterDelay = 1;

// 默认组合名称
const defaultCombinationName = '自定义组合';

// 新增组合
export const ExpandAddButton = ({ lang, combinationConfig, refreshManage }) => {
    const [combinationName, setCombinationName] = React.useState();
    const [combinationDesc, setCombinationDesc] = React.useState();

    combinationConfig.name = combinationConfig.name || defaultCombinationName;
    combinationConfig.description = combinationConfig.description || combinationConfig.name;
    // 添加组合
    const handleAddCombination = () => {
        const item = {};
        item.name = combinationName || defaultCombinationName;
        item.description = combinationDesc || item.name;
        item.combination = [];

        requestService(addCombination, lang, item)
            .then(() => {
                message.success("创建成功")
                refreshManage();
            }).catch(reason => message.warn("创建失败, 原因是" + reason))
    }
    return <Popconfirm icon={null} cancelText='取消' okText='新建'
        onConfirm={handleAddCombination} placement="right"
        title={<>
            <Typography.Title level={5}>新建组合</Typography.Title>
            <Input addonBefore={'组合名称'} placeholder={combinationConfig.name} value={combinationName} onChange={e => setCombinationName(e.target.value)} />
            <Input style={{ marginTop: '3px' }} addonBefore={'组合作用'} placeholder={combinationConfig.description} value={combinationDesc} onChange={e => setCombinationDesc(e.target.value)} />
        </>} >
        <Button style={{ marginLeft: '10px' }} shape="circle" type="text" icon={<PlusOutlined />} size="small" />
    </Popconfirm>
}

// 将list转换成对象
const convertConfigDataSource = (list) => {
    const data = {};
    for (let item of list) {
        data[item.id] = { ...item };
    }
    return data;
}


// 配置表格弹出框
const ConfigTableModal = ({ visible, setVisible, handleAddConfig, configDataSource }) => {
    const [selectKey, setSelectKey] = React.useState();
    // 加载数据源
    const loadDataSource = () => {
        const arr = [];
        for (let config of configDataSource) {
            arr.push({ id: config.id, name: config.name, description: config.description, costom: ScriptUtil.isBasic(config) ? 0 : 1 });
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


    return (<Modal title="配置选择" open={visible} cancelText="取消" okText="确认"
        onCancel={clearModal} onOk={handleConfigSelect} >
        <Table
            rowSelection={{ ...rowSelection }}
            rowKey="id"
            columns={columns}
            dataSource={loadDataSource()}
            pagination={false}
        />
    </Modal>)
}


// 扩展按钮
export const ExpandManageButton = ({ lang, combinationConfig, refreshManage, handleConvert, configDataSource }) => {
    const [visible, setVisible] = React.useState(false);
    const [frameVisible, setFrameVisible] = React.useState(false);
    const [frameIndex, setFrameIndex] = React.useState(false);

    const [combinationName, setCombinationName] = React.useState(combinationConfig.name);
    const [combinationDesc, setCombinationDesc] = React.useState(combinationConfig.description);
    const [combinationConfigIdList, setCombinationConfigIdList] = React.useState([...combinationConfig.combination]);

    // 待处理数据
    const configDataObj = convertConfigDataSource(configDataSource);
    const timelineItemList = combinationConfigIdList.map((id, index) => {
        const item = configDataObj[id] || {};
        item.index = index;
        return item;
    });

    // 重置组合
    const handleReset = () => {
        setCombinationName(combinationConfig.name)
        setCombinationDesc(combinationConfig.description)
        setCombinationConfigIdList([...combinationConfig.combination])
    }
    // 取消组合
    const handleCancel = () => {
        setVisible(false);
    }
    // 添加配置
    const handleAddConfig = configId => {
        if (!frameVisible) {
            // 添加失败, 窗口未打开
            return;
        }

        const arr = [];
        for (let i = 0; i < combinationConfigIdList.length; i++) {
            arr.push(combinationConfigIdList[i]);
            if (i === frameIndex) {
                arr.push(configId);
            }
        }
        if (frameIndex === -1) {
            arr.push(configId);
        }
        setCombinationConfigIdList(arr)
    }
    // 删除组合
    const handleDelete = () => {
        requestService(deleteCombination, lang, combinationConfig.id)
            .then(() => {
                message.success("删除成功");
                setVisible(false);
                refreshManage();
            }).catch(reason => message.success("删除失败, 原因是" + reason))
    }
    // 保存组合
    const handleSave = () => {
        if (combinationConfigIdList.length === 0) {
            message.warn("请先维护节点");
            return;
        }
        if (!combinationName) {
            message.warn("请维护组合名称");
            return;
        }
        for (const configId of combinationConfigIdList) {
            if (ScriptUtil.isBasic({ id: configId })) {
                continue;
            }
            if (!storeEditService.queryConfigById(lang, configId)) {
                message.warn("脚本配置不存在, 请刷新页面");
                return
            }
        }
        const item = {
            id: combinationConfig.id,
            name: combinationName,
            description: combinationDesc || combinationName,
            combination: combinationConfigIdList
        };
        requestService(updateCombination, lang, item)
            .then(() => {
                message.success("保存成功");
                setVisible(false);
                refreshManage();
            }).catch(reason => message.error("保存失败, 原因是: " + reason));
    }
    // 删除组合配置
    const handleDeleteCombinationConfig = (index) => {
        combinationConfigIdList.splice(index, 1);
        setCombinationConfigIdList([...combinationConfigIdList]);
    }
    // 组合数据是否发生变化
    const combinationConfigChangeFlag = () => {
        if (combinationConfigIdList.length !== combinationConfig.combination.length) {
            return true;
        }
        for (let i = 0; i++; i <= combinationConfigIdList.length) {
            if (combinationConfigIdList[i] !== combinationConfig.combination[i]) {
                return true;
            }
        }
        return combinationName !== combinationConfig.name || combinationDesc !== combinationConfig.description;
    }
    // 打开配置弹出框
    const openConfigTableModal = (index) => {
        setFrameIndex(index);
        setFrameVisible(true);
    }

    return (<>
        <Tooltip style={{ marginLeft: '15px' }} title={combinationConfig.description} mouseEnterDelay={tipMouseEnterDelay}>
            <Button type="dashed" onClick={e => handleConvert(combinationConfig.combination)}>{combinationConfig.name}</Button>
        </Tooltip>
        <Tooltip title="编辑" mouseEnterDelay={tipMouseEnterDelay * 2}>
            <Button shape="circle" type="text" onClick={e => setVisible(true)} icon={<EditOutlined />} size="small" />
        </Tooltip>

        <Drawer open={visible} onCancel={handleCancel}
            title={combinationConfigChangeFlag() ? <Text style={{ color: "#1890ff" }} strong >编辑组合 *</Text> : <Text>编辑组合</Text>}
            onClose={handleCancel}
            footer={<Row justify="end">
                <Space>
                    <Col><Button key="reset" onClick={handleReset}>重置</Button></Col>
                    <Col><Button key="delete" onClick={handleDelete}>删除组合</Button></Col>
                    <Col><Button type='primary' onClick={handleSave}>保存组合</Button></Col>
                </Space>
            </Row>}
        >
            <Input addonBefore={'组合名称'} value={combinationName} onChange={e => setCombinationName(e.target.value)} />
            <Input style={{ marginTop: '5px', marginBottom: '15px' }} addonBefore={'组合作用'} value={combinationDesc} onChange={e => setCombinationDesc(e.target.value)} />

            <Timeline mode="left">
                {(timelineItemList.length === 0) && (
                    <Timeline.Item key={0} color="gray">
                        <Tooltip title="添加" mouseEnterDelay={tipMouseEnterDelay * 2} ><Button shape="circle" type="text" icon={<PlusOutlined />} onClick={e => openConfigTableModal(-1)}></Button></Tooltip>
                    </Timeline.Item>
                )}
                {timelineItemList.map((item, index) => {
                    return (<Timeline.Item key={index} color={item.id > 0 ? '#faad14' : '#52c41a'}>
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