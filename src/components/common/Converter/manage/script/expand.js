import React from 'react';
import { Button, Input, Drawer, Row, Col, Space, Tooltip, Popconfirm, Typography, message } from 'antd';
import CodeEditor from '../../editor/codeEditor';
import storeEditService, { requestService } from '../../store/storeEditService';
import { EditOutlined } from '@ant-design/icons';

const { addConfig, updateConfig, deleteConfig } = storeEditService;
const { Text } = Typography;

// 鼠标移入后延时多少才显示 Tooltip，单位：秒
const tipMouseEnterDelay = 1;

// 扩展添加配置按钮
const AddConfigButton = ({ lang, config, scriptContent, onAddSuccess }) => {
    const defaultConfigName = config.name;
    const defaultConfigDesc = config.description || defaultConfigName;
    const [configName, setConfigName] = React.useState();
    const [configDesc, setConfigDesc] = React.useState();
    const handleAddConfig = () => {
        if (!scriptContent) {
            message.warn("脚本内容不能为空");
            return false;
        }
        const newConfig = {
            name: configName || defaultConfigName,
            description: configDesc || configName || defaultConfigDesc,
            scriptContent: scriptContent
        }
        requestService(addConfig, lang, newConfig)
            .then(() => {
                setConfigName(null)
                setConfigDesc(null)
                message.success("添加配置成功")
                onAddSuccess()
            })
            .catch(reason => message.error("添加配置失败, 失败原因: " + reason));
    }

    return (<Popconfirm icon={null} cancelText='取消' okText='确认'
        onConfirm={handleAddConfig}
        title={<>
            <Input addonBefore={'功能名称'} placeholder={defaultConfigName} value={configName} onChange={e => setConfigName(e.target.value)} />
            <Input style={{ marginTop: '3px' }} addonBefore={'功能作用'} placeholder={defaultConfigDesc} value={configDesc} onChange={e => setConfigDesc(e.target.value)} />
        </>} >
        <Button>添加自定义配置</Button>
    </Popconfirm>);
}

// 按钮组的扩展按钮
export const ExpandAddButton = ({ lang, context, config, refreshScript, editorHelpRender }) => {
    const [visible, setVisible] = React.useState(false);
    const [scriptContent, setScriptContent] = React.useState(config.scriptContent);
    const handleCancel = () => {
        setVisible(false);
    };
    const handleConfirm = () => {
        if (!scriptContent) {
            message.warn("脚本内容不能为空")
            return;
        }
        context.onConvert([scriptContent])
        setVisible(false);
    };
    const handleAddSuccess = () => {
        // 影藏窗口
        setVisible(false)
        // 刷新父级页面
        refreshScript();
    }
    return (<>
        <Tooltip title={config.description} mouseEnterDelay={tipMouseEnterDelay}>
            <Button onClick={() => setVisible(true)}>{config.name}</Button>
        </Tooltip>
        <Drawer title={config.name} open={visible} width='75%'
            onClose={handleCancel}
            footer={<Row justify="end">
                <Space>
                    <Col><AddConfigButton key='add' lang={lang} config={config} scriptContent={scriptContent} onAddSuccess={handleAddSuccess} /></Col>
                    <Col><Button key="convert" type="primary" onClick={handleConfirm}>转换</Button></Col>
                </Space>
            </Row>} >
            <CodeEditor value={scriptContent} onChange={setScriptContent} editorHelpRender={editorHelpRender} />
        </Drawer>
    </>);
}

// 扩展管理弹出框
const ExpandManageModal = ({ lang, config, visible, setVisible, editorHelpRender, refreshScript }) => {
    const [configName, setConfigName] = React.useState(config.name);
    const [configDesc, setConfigDesc] = React.useState(config.description);
    const [scriptContent, setScriptContent] = React.useState(config.scriptContent);
    // 取消
    const handleCancel = () => setVisible(false);
    // 重置
    const handleReset = () => {
        setConfigName(config.name)
        setConfigDesc(config.description)
        setScriptContent(config.scriptContent)
    };
    // 删除配置
    const handleRemove = () => {
        requestService(deleteConfig, lang, config.id)
            .then(() => {
                message.success("删除配置成功")
                handleCancel()
                refreshScript()
            })
            .catch(reason => message.error("删除配置失败, 失败原因: " + reason));
    }
    // 更新配置
    const handleSave = () => {
        if (!configName) {
            message.error("功能名称不能为空");
            return;
        }
        if (!scriptContent) {
            message.error("脚本内容不能为空")
            return;
        }
        const newConfig = {
            id: config.id,
            name: configName,
            description: configDesc || configName,
            scriptContent: scriptContent
        }
        requestService(updateConfig, lang, newConfig)
            .then(() => {
                message.success("更新配置成功")
                handleCancel()
                refreshScript()
            })
            .catch(reason => console.log(reason) & message.error("更新配置失败, 失败原因: " + reason));
    }
    // 配置数据是否发生变化
    const configChangeFlag = () => {
        return configName !== config.name || configDesc !== config.description || scriptContent !== config.scriptContent;
    }
    return (<Drawer open={visible} width='75%' onCancel={handleCancel}
        title={configChangeFlag() ? <Text style={{ color: "#1890ff" }} strong >编辑配置 *</Text> : <Text>编辑配置</Text>}
        onClose={handleCancel}
        footer={<Row justify="end">
            <Space>
                <Col><Button key="reset" onClick={handleReset}>重置</Button></Col>
                <Col><Button key="remove" onClick={handleRemove}>删除配置</Button></Col>
                <Col><Button key="update" type="primary" onClick={handleSave}>更新配置</Button></Col>
            </Space>
        </Row>} >
        <Input addonBefore={'功能名称'} value={configName} onChange={e => setConfigName(e.target.value)} />
        <Input style={{ marginTop: '3px' }} addonBefore={'功能作用'} value={configDesc} onChange={e => setConfigDesc(e.target.value)} />
        <CodeEditor lang={lang} value={scriptContent} onChange={setScriptContent} editorHelpRender={editorHelpRender} />
    </Drawer>)
}

// 扩展管理按钮
export const ExpandManageButton = ({ lang, config, handleConvert, editorHelpRender, refreshScript }) => {
    const [visible, setVisible] = React.useState(false);
    return (<>
        <Tooltip title={config.description} mouseEnterDelay={tipMouseEnterDelay}>
            <Button type="dashed" onClick={e => handleConvert(config.scriptContent)}>{config.name}</Button>
        </Tooltip>
        <Tooltip title="编辑" mouseEnterDelay={tipMouseEnterDelay * 2}>
            <Button shape="circle" type="text" onClick={e => setVisible(true)} icon={<EditOutlined />} size="small" />
        </Tooltip>
        <ExpandManageModal lang={lang} config={config} visible={visible} setVisible={setVisible}
            editorHelpRender={editorHelpRender} refreshScript={refreshScript} />
    </>);
}
