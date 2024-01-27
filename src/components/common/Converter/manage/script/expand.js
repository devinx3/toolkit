import React from 'react';
import { Dropdown, Button, Input, Drawer, Row, Col, Space, Tooltip, Popconfirm, Typography, message } from 'antd';
import CodeEditor from '../../editor/codeEditor';
import storeEditService, { requestService } from '../../store/storeEditService';
import { SCRIPT_CODE_PREFIX } from '../../constants'
import { EditOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

const { addConfig, updateConfig, hiddenConfig, deleteConfig } = storeEditService;
const { Text } = Typography;

// 鼠标移入后延时多少才显示 Tooltip，单位：秒
const tipMouseEnterDelay = 1;

// 扩展添加节点按钮
const AddConfigButton = ({ category, config, scriptContent, onAddSuccess }) => {
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
        requestService(addConfig, category, newConfig)
            .then(() => {
                setConfigName(null)
                setConfigDesc(null)
                message.success("添加节点成功")
                onAddSuccess()
            })
            .catch(reason => message.error("添加节点失败, 失败原因: " + reason));
    }

    return (<Popconfirm icon={null} cancelText='取消' okText='确认'
        onConfirm={handleAddConfig}
        title={<>
            <Input addonBefore={'节点名称'} placeholder={defaultConfigName} value={configName} onChange={e => setConfigName(e.target.value)} />
            <Input style={{ marginTop: '3px' }} addonBefore={'节点作用'} placeholder={defaultConfigDesc} value={configDesc} onChange={e => setConfigDesc(e.target.value)} />
        </>} >
        <Button>添加自定义节点</Button>
    </Popconfirm>);
}

// 种子
const nextSeed = (() => {
    let version = 100;
    return () => version++;
})();
// 按钮组的扩展按钮
export const ExpandAddButton = ({ category, context, config, refreshScript, editorHelpRender }) => {
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
        const version = nextSeed(); 
        const code = SCRIPT_CODE_PREFIX.EXPAND_ADD + "CONVERT";
        context.onConvert(context.createScriptEvent(code, config.name, scriptContent, version));
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
                    <Col><AddConfigButton key='add' category={category} config={config} scriptContent={scriptContent} onAddSuccess={handleAddSuccess} /></Col>
                    <Col><Button key="convert" type="primary" onClick={handleConfirm}>执行</Button></Col>
                </Space>
            </Row>} >
            <CodeEditor path={`${category}|${SCRIPT_CODE_PREFIX.EXPAND_ADD}CONVERT|script`} value={scriptContent} onChange={setScriptContent} editorHelpRender={editorHelpRender} />
        </Drawer>
    </>);
}

// 扩展管理弹出框
const ExpandManageModal = ({ category, config, visible, setVisible, editorHelpRender, refreshScript }) => {
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
    // 删除节点
    const handleRemove = () => {
        requestService(deleteConfig, category, config.code)
            .then(() => {
                message.success("删除节点成功")
                handleCancel()
                refreshScript()
            })
            .catch(reason => message.error("删除节点失败, 失败原因: " + reason));
    }
    // 更新节点
    const handleSave = () => {
        if (!configName) {
            message.error("节点名称不能为空");
            return;
        }
        if (!scriptContent) {
            message.error("脚本内容不能为空")
            return;
        }
        const newConfig = {
            code: config.code,
            name: configName,
            description: configDesc || configName,
            scriptContent: scriptContent
        }
        requestService(updateConfig, category, newConfig)
            .then(() => {
                message.success("更新节点成功")
                handleCancel()
                refreshScript()
            })
            .catch(reason => console.log(reason) & message.error("更新节点失败, 失败原因: " + reason));
    }
    // 节点数据是否发生变化
    const configChangeFlag = () => {
        return configName !== config.name || configDesc !== config.description || scriptContent !== config.scriptContent;
    }
    return (<Drawer open={visible} width='75%' onCancel={handleCancel}
        title={configChangeFlag() ? <Text style={{ color: "#1890ff" }} strong >编辑节点 *</Text> : <Text>编辑节点</Text>}
        onClose={handleCancel}
        footer={<Row justify="end">
            <Space>
                <Col><Button key="reset" onClick={handleReset}>重置</Button></Col>
                <Col><Button key="remove" onClick={handleRemove}>删除节点</Button></Col>
                <Col><Button key="update" type="primary" onClick={handleSave}>更新节点</Button></Col>
            </Space>
        </Row>} >
        <Input addonBefore={'节点名称'} value={configName} onChange={e => setConfigName(e.target.value)} />
        <Input style={{ marginTop: '3px' }} addonBefore={'节点作用'} value={configDesc} onChange={e => setConfigDesc(e.target.value)} />
        <CodeEditor path={`${category}|${config.code}|script`} value={scriptContent} onChange={setScriptContent} editorHelpRender={editorHelpRender} />
    </Drawer>)
}

// 扩展管理按钮
export const ExpandManageButton = ({ category, config, handleConvert, editorHelpRender, refreshScript }) => {
    const handleHiddenConfig = () => {
        requestService(hiddenConfig, category, config.code)
            .then(() => {
                message.success("隐藏成功")
                refreshScript()
            })
            .catch(reason => console.log(reason) & message.error("更新节点失败, 失败原因: " + reason));
    }
    const [visible, setVisible] = React.useState(false);
    const menus = [{
        key: "edit",
        label: (<Button shape="circle" type="text" onClick={e => setVisible(true)} icon={<EditOutlined />} size="small" >编辑</Button>)
    }, {
        key: "hidden",
        label: (<Button shape="circle" type="text" onClick={e => handleHiddenConfig()} icon={<EyeInvisibleOutlined />} size="small">隐藏</Button>)
    }];
    return (<>
        <Dropdown arrow={false} autoAdjustOverflow={true} menu={{ items: menus }} trigger={['contextMenu']} >
            <div>
                <Tooltip title={config.description} mouseEnterDelay={tipMouseEnterDelay}>
                    <Button type="dashed" onClick={e => handleConvert(config)}>{config.name}</Button>
                </Tooltip>
            </div>
        </Dropdown>
        <ExpandManageModal category={category} config={config} visible={visible} setVisible={setVisible}
            editorHelpRender={editorHelpRender} refreshScript={refreshScript} />
    </>);
}
