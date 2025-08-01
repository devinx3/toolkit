
import { Alert, Col, Row, message } from 'antd';
import React from 'react';
import { LANG } from '../../common/Converter/constants';
import { ConvertContext } from '../../common/Converter';
import StrUtil from '../../../utils/StrUtil'
import { convertOuput, ScriptErrorBoundary } from '../Template'
import { restoreByShareData, restoreByImportData } from '../../common/Converter/manage/backup';
import { } from '../../common/Converter/manage/handler';
import axios from 'axios';

const DataBlock = React.lazy(() => import("../../common/Converter/data"));

const createSearch = (url) => {
    const idx = url?.indexOf ? url.indexOf("?") : -1;
    return new URLSearchParams(idx < 0 ? undefined : url.substring(idx + 1));
}
const search = createSearch(window.location.href);

const getFirstScriptByUrl = async (url, secretKey) => {
    const response = await axios.get(url, { responseType: 'text' });
    if (response.status !== 200) {
        throw new Error(response.statusText);
    }
    let newList = restoreByImportData(response.data, secretKey);
    if (newList.length !== 1) {
        console.log(`前有${newList.length}个组件, 仅仅渲染了第1个组件`);
    }
    return newList[0];
}
const getScript = async () => {
    let shareData = search.get("shareData");
    if (shareData) {
        return restoreByShareData(shareData);
    }
    let secretKey = search.get("secretKey");
    let importUrl = search.get("importUrl");
    if (importUrl) {
        importUrl = window.decodeURIComponent(importUrl);
        secretKey = secretKey || createSearch(importUrl).get("secretKey")?.trim();
        return getFirstScriptByUrl(importUrl, secretKey);
    }

    let gist = search.get("githubGist");
    if (gist) {
        let username = search.get("username") || "devinx3";
        let gistUrl = 'https://gist.githubusercontent.com/' + username + '/' + gist;
        if (!gist.includes("/")) {
            gistUrl += '/raw';
        }
        return getFirstScriptByUrl(gistUrl, secretKey);
    }

    let dpasteItemId = search.get("dpasteItemId");
    if (dpasteItemId) {
        return getFirstScriptByUrl(`https://dpaste.com/${dpasteItemId}.txt`, secretKey);
    }
    return null;
}

// 数据块渲染
const DataBlockRender = ({ state, context, manageBlock, getCurrentNode }) => {
    const { outputData, errorMsg } = state;
    let currentNode = getCurrentNode();
    const OutputEle = StrUtil.isBlank(errorMsg) ? convertOuput(outputData) : [];
    let alertMessage = StrUtil.isBlank(errorMsg) && !OutputEle ? "" : errorMsg;
    let children = null;
    if (StrUtil.isBlank(alertMessage)) {
        if (OutputEle) {
            children = <ScriptErrorBoundary nodeName={currentNode?.name}>{OutputEle instanceof Function ? React.createElement(OutputEle) : OutputEle}</ScriptErrorBoundary>;
        } else {
            children = !outputData ? manageBlock : <>{manageBlock}<div style={{ margin: '15px' }}><Row><Col span={8}><Alert message={"无渲染组件"} type="error" /></Col></Row></div></>;
        }
    } else {
        children = <>{manageBlock}<div style={{ margin: '15px' }}><Row><Col><Alert message={<pre style={{ marginBottom: 0, minWidth: "28vw" }}>{alertMessage}</pre>} type="error" /></Col></Row></div></>;
    }
    return <div>
        {children}
    </div>
}
let runned = false;
const CustomizationPage = () => {
    const context = React.useMemo(() => new ConvertContext(), []);
    React.useEffect(() => {
        if (runned) {
            return;
        }
        runned = true;
        getScript().then(scriptInfo => {
            if (scriptInfo) {
                context.onConvert(context.createScriptEvent(scriptInfo.code, scriptInfo.name, scriptInfo.scriptContent, scriptInfo.version));
                if (scriptInfo.name) {
                    setTimeout(() => window.document.title = scriptInfo.name, 300);
                }
            } else {
                context.onConvert(context.createScriptEvent("empty", "page", "", 1));
            }
        }).catch(e => {
            console.error("获取脚本失败", e);
            message.error("获取脚本失败: " + (e.message || ''), 0);
        });
    }, [context]);
    const dataConfig = {
        lang: LANG.JSX,
        category: `customize-initial-page`,
        context,
        dataBlockRender: DataBlockRender
    };
    return <div style={{ marginLeft: '5px', marginTop: '10px' }} >
        <DataBlock {...dataConfig} />
    </div>
}

export default CustomizationPage;