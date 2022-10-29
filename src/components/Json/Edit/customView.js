import React from 'react';
import { Button, Input, Modal, Tooltip, message, Row, Col } from 'antd';

import JsonEditService from '../../../services/JsonEditService'
import CodeEditView from './codeEdit'

import { EditOutlined } from '@ant-design/icons';


const ItemView = ({config, refreshView, handleConvertData}) => {
    const [scriptContent, setScriptContent] = React.useState(config.scriptContent);
    const [visible, setVisible] = React.useState(false);
    const [configName, setConfigName] = React.useState(config.name);
    const [configDesc, setConfigDesc] = React.useState(config.describe);

    const showModal = () => {
        setVisible(true);
    };
    const handleSaveConfig = () => {
        const newConfig = {...config, name: configName || config.name, describe: configDesc || config.describe, scriptContent:scriptContent};
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
        setConfigDesc(config.describe)
        setScriptContent(config.scriptContent)
    };
    return (<>
        <Button style={{marginLeft: '15px'}} type="dashed" onClick={e => handleConvertData(config.scriptContent)}>{config.name}</Button>
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

const CustomView = ({style, handleConvertData}) => {
    const [changeConfig, setChangeConfig ] = React.useState(false);
    const refreshView = () => {
        setChangeConfig(!changeConfig);
    }
    const dataSource = JsonEditService.listAll();
    if (!dataSource || dataSource.length === 0) {
        return null;
    }

    return (<Row style={style}>
        <Col>
            自定义配置:
        </Col>
        <Col style={{marginLeft: '5px'}}>
            {dataSource.map(item => <ItemView key={item.id} config={item} refreshView={refreshView} handleConvertData={handleConvertData}/>)}
        </Col>
    </Row>);
}

export default CustomView;

