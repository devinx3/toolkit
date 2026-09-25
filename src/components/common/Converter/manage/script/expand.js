import React from 'react';
import { Dropdown, Button, Input, Drawer, Row, Col, Space, Tooltip, Popconfirm, Typography, message } from 'antd';
import CodeEditor from '../../editor/codeEditor';
import storeEditService, { requestService } from '../../store/storeEditService';
import { SCRIPT_CODE_PREFIX, SCRIPT_TYPE } from '../../constants'
import { EditOutlined, EyeInvisibleOutlined, ShareAltOutlined } from '@ant-design/icons';
import StrUtil from '../../../../../utils/StrUtil';
import lzString from 'lz-string'
import axios from 'axios';
import { backup2ShareData } from '../backup';

const { addConfig, updateConfig, hiddenConfig, deleteConfig } = storeEditService;
const { Text } = Typography;

// 鼠标移入后延时多少才显示 Tooltip，单位：秒
const tipMouseEnterDelay = 1;

// 扩展添加节点按钮
const AddConfigButton = ({ category, config, name, description, scriptContent, onAddSuccess }) => {
    const defaultConfigName = config.name;
    const defaultConfigDesc = config.description || defaultConfigName;
    const [configName, setConfigName] = React.useState(name);
    const [configDesc, setConfigDesc] = React.useState(description);
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
    const handleShare = () => {
        if (!scriptContent) {
            message.warn("脚本内容不能为空");
            return false;
        }
        let shareUrl = generateShareUrl({
            name: configName || defaultConfigName,
            description: configDesc || configName || defaultConfigDesc,
            scriptContent: scriptContent
        });
        if (StrUtil.copyToClipboard(shareUrl)) {
            message.info("已复制分享链接")
        }
    }
    return (<Space>
        <Button onClick={handleShare}>分享</Button>
        <Button onClick={e => handleShortShare({
            name: configName || defaultConfigName,
            description: configDesc || configName || defaultConfigDesc,
            scriptContent: scriptContent
        })}>临时分享</Button>
        <Popconfirm icon={null} cancelText='取消' okText='确认'
            onConfirm={handleAddConfig}
            title={<>
                <Input addonBefore={'节点名称'} placeholder={defaultConfigName} value={configName} onChange={e => setConfigName(e.target.value)} />
                <Input style={{ marginTop: '3px' }} addonBefore={'节点作用'} placeholder={defaultConfigDesc} value={configDesc} onChange={e => setConfigDesc(e.target.value)} />
            </>} >
            <Button>添加自定义节点</Button>
        </Popconfirm>
    </Space>);
}

// 种子
const nextSeed = (() => {
    let version = 100;
    return () => version++;
})();
const getShareData = async (intelligent) => {
    if (intelligent.getShareData()) {
        let data = lzString.decompressFromEncodedURIComponent(intelligent.getShareData());
        intelligent.clearShareData();
        let jsonData = {}
        try {
            jsonData = JSON.parse(data)
        } catch (e) {
            message.error("分享数据格式异常");
            return undefined;
        }
        return {
            name: jsonData.name,
            description: jsonData.description,
            scriptContent: jsonData.scriptContent,
        };
    } else if (intelligent.getShareId()) {
        let shareId = intelligent.getShareId();
        intelligent.clearShareData();
        const response = await axios.get('/api/storage/share/' + shareId);
        if (response.status !== 200) {
            message.error("分享数据获取异常：" + (response.data?.error || response.statusText));
            return undefined;
        }
        if (!response.data?.content) {
            message.error("分享数据为空");
            return undefined;
        }
        let data = lzString.decompressFromEncodedURIComponent(response.data.content);
        let jsonData = {}
        try {
            jsonData = JSON.parse(data)
        } catch (e) {
            message.error("分享数据格式异常");
            return undefined;
        }
        return {
            name: jsonData.name,
            description: jsonData.description,
            scriptContent: jsonData.scriptContent,
        };
    }
    return undefined;
}
// 按钮组的扩展按钮
export const ExpandAddButton = ({ category, context, config, refreshScript, editorHelpRender, intelligent, aiRender }) => {
    const [visible, setVisible] = React.useState(false);
    const [refData, setRefData] = React.useState({})
    const [scriptContent, setScriptContent] = React.useState(config.scriptContent);
    const handleCancel = () => {
        setVisible(false);
    };
    React.useEffect(() => {
        getShareData(intelligent)
        .then(newData => {
            if (newData) {
                setRefData(newData);
                setScriptContent(newData.scriptContent);
                setVisible(true);
            }
        })
    }, [intelligent]);
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
                    <Col><AddConfigButton key='add' category={category} config={config}
                        name={refData.name} description={refData.description} scriptContent={scriptContent}
                        onAddSuccess={handleAddSuccess} /></Col>
                    <Col><Button key="convert" type="primary" onClick={handleConfirm}>执行</Button></Col>
                </Space>
            </Row>} >
            <CodeEditor category={category} path={`${category}|${SCRIPT_CODE_PREFIX.EXPAND_ADD}CONVERT|script`} value={scriptContent} onChange={setScriptContent} editorHelpRender={editorHelpRender} aiRender={aiRender} />
        </Drawer>
    </>);
}

// 扩展管理弹出框
const ExpandManageModal = ({ category, config, visible, setVisible, editorHelpRender, aiRender, refreshScript }) => {
    const [configName, setConfigName] = React.useState(config.name);
    const [configDesc, setConfigDesc] = React.useState(config.description);
    const [scriptContent, setScriptContent] = React.useState(config.scriptContent);
    const handleSaveCode = React.useRef(null);
    const handleRunCode = React.useRef(null);
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
    React.useEffect(() => {
        if (category.startsWith("customize") && config.code) {
            handleSaveCode.current = (code, callback) => {
                const newConfig = {
                    code: config.code,
                    name: config.name,
                    description: config.description,
                    scriptContent: code
                }
                requestService(updateConfig, category, newConfig)
                    .then(() => callback && callback())
                    .catch(reason => console.log(reason) & message.error("保存代码失败, 失败原因: " + reason));
            }
            handleRunCode.current = () => {
                const idx = window.location.href.indexOf("?");
                const url = idx === -1 ? window.location.href : window.location.href.substring(0, idx);
                window.open(url + '?clickType=node&clickCode=' + config.code);
            }
        } else {
            handleRunCode.current = null;
            handleSaveCode.current = null;
        }
    }, [category, config]);
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
        <CodeEditor category={category} path={`${category}|${config.code}|script`} value={scriptContent}
            onChange={setScriptContent} onRunCode={handleRunCode.current} onSaveCode={handleSaveCode.current}
            editorHelpRender={editorHelpRender} aiRender={aiRender} />
    </Drawer>)
}

const generateShareUrl = (shareData) => {
    let newShareData = { name: shareData.name + "(来自分享)", description: shareData.description, scriptContent: shareData.scriptContent }
    let shareDataParam = backup2ShareData(newShareData);
    let newUrl = null
    if (window.location.pathname.startsWith("/customize/")) {
        newUrl = `${window.location.protocol}//${window.location.host}/customize/cat/initial`
    } else {
        const idx = window.location.href.indexOf("?");
        newUrl = (idx === -1 ? window.location.href : window.location.href.substring(0, idx));
    }
    return newUrl + "?shareData=" + shareDataParam;
}

// 通过服务端存储生成分享链接（30 天有效）
const generateShareIdUrl = async (shareData) => {
    const newShareData = { name: shareData.name + "(来自分享)", description: shareData.description, scriptContent: shareData.scriptContent };
    // 存储压缩后的 shareData，读取端直接按 ?shareData 的逻辑恢复
    const shareDataParam = backup2ShareData(newShareData);
    const response = await axios.post('/api/storage/share', { content: shareDataParam });
    if (response.status !== 200 || !response.data?.shareId) {
        throw new Error(response.data?.error || response.statusText);
    }
    let newUrl = null
    if (window.location.pathname.startsWith("/customize/")) {
        newUrl = `${window.location.protocol}//${window.location.host}/customize/cat/initial`
    } else {
        const idx = window.location.href.indexOf("?");
        newUrl = (idx === -1 ? window.location.href : window.location.href.substring(0, idx));
    }
    return newUrl + "?shareId=" + response.data.shareId;
}
// 短链接分享，成功后复制链接
const handleShortShare = (shareData) => {
    generateShareIdUrl(shareData)
        .then(shareUrl => {
            const copyText = '链接：' + shareUrl + '\n复制这段内容打开「'+ window.location.hostname + '」查看分享内容';
            if (StrUtil.copyToClipboard(copyText)) {
                message.info("已复制分享内容(30天有效)")
            }
        })
        .catch(reason => message.error("分享失败, 失败原因: " + (reason.message || reason)));
}
// 扩展管理按钮
export const ExpandManageButton = ({ category, intelligent, config, handleConvert, editorHelpRender, aiRender, refreshScript }) => {
    const handleHiddenConfig = () => {
        requestService(hiddenConfig, category, config.code)
            .then(() => {
                message.success("隐藏成功")
                refreshScript()
            })
            .catch(reason => console.log(reason) & message.error("更新节点失败, 失败原因: " + reason));
    }
    // 分享数据
    const handleShareData = () => {
        if (StrUtil.copyToClipboard(generateShareUrl(config))) {
            message.info("已复制分享链接")
        }
    }
    const [visible, setVisible] = React.useState(false);
    const menus = [{
        key: "edit",
        label: (<Button shape="circle" type="text" onClick={e => setVisible(true)} icon={<EditOutlined />} size="small" >编辑</Button>)
    }, {
        key: "hidden",
        label: (<Button shape="circle" type="text" onClick={e => handleHiddenConfig()} icon={<EyeInvisibleOutlined />} size="small">隐藏</Button>)
    }, {
        key: "share",
        label: (<Button shape="circle" type="text" onClick={e => handleShareData()} icon={<ShareAltOutlined />} size="small">分享</Button>)
    }, {
        key: "share30",
        label: (<Button shape="circle" type="text" onClick={e => handleShortShare(config)} icon={<ShareAltOutlined />} size="small">临时分享</Button>)
    }];
    // clickCode 自动触发（放在 useEffect 中，避免 render 阶段的副作用）
    React.useEffect(() => {
        if (intelligent.canClick(SCRIPT_TYPE.NODE, config.code)) {
            intelligent.clearClick();
            setTimeout(() => handleConvert(config), 0);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return (<>
        <Dropdown arrow={false} autoAdjustOverflow={true} menu={{ items: menus }} trigger={['contextMenu']} >
            <div>
                <Tooltip title={config.description} mouseEnterDelay={tipMouseEnterDelay}>
                    <Button type="dashed" onClick={e => handleConvert(config)}>{config.name}</Button>
                </Tooltip>
            </div>
        </Dropdown>
        <ExpandManageModal category={category} config={config} visible={visible} setVisible={setVisible}
            editorHelpRender={editorHelpRender} aiRender={aiRender} refreshScript={refreshScript} />
    </>);
}
