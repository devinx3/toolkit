import React from 'react';
import { Button, Row, Col, message } from 'antd';

import storeEditService from '../../store/storeEditService';
import { ExpandAddButton, ExpandManageButton } from './expand'
import { ScriptUtil } from '../handler';

/**
 * 获取相关语言对应的组合信息
 * @param {string} lang 语言
 * @returns 根据语言加载组合
 */
const loadConfigByLang = (lang) => {
    return storeEditService.listAllConfig(lang) || [];
}
/**
 * 获取相关语言对应的组合信息
 * @param {string} lang 语言
 * @returns 根据语言加载组合
 */
const loadCombinationByLang = (lang) => {
    return storeEditService.listAllCombination(lang) || [];
}

/**
 * 组合列表
 */
const ExpandManageList = () => {
    return <Button type='link' disabled>组合管理</Button>
}

/**
 * 根据配置ID获取脚本内容
 * @param {语言} lang 
 * @param {基本按钮} basicButtons 
 * @param {配置ID} configId 
 * @returns 
 */
const getScriptConfig = (lang, basicButtons, configId) => {
    if (ScriptUtil.isBasicById(configId)) {
        for (let basicButton of basicButtons) {
            if (configId === basicButton.id) {
                return basicButton;
            }
        }
    }
    return storeEditService.queryConfigById(lang, configId);
}

// 脚本组合管理
const CombinationManage = ({ lang, context, basicButtons, expandAddButton }) => {
    const expandButtons = loadCombinationByLang(lang) || [];
    const [refresh, setRefresh] = React.useState(false);
    const configButtons = loadConfigByLang(lang);
    if (configButtons.length === 0) {
        return <></>;
    }
    basicButtons = ScriptUtil.convertBasicButtons(basicButtons)
    const refreshManage = () => setRefresh(!refresh);
    /**
     * 执行转换
     * @param {string} scriptContent 脚本内容
     * @returns 转换结果
     */
    const handleConvert = idList => {
        if (!idList || idList.length === 0) {
            message.error("不存在任何配置")
            return;
        }
        let errorMessage = null;
        const scriptContentList = idList.map(id => {
            const scriptConfig = getScriptConfig(lang, basicButtons, id);
            if (!scriptConfig) {
                errorMessage = "配置不存在";
                return null;
            }else if (!scriptConfig.scriptContent) {
                errorMessage = "脚本内容为空";
                return null;
            }
            return {
                name: scriptConfig.name,
                content: scriptConfig.scriptContent
            };
        })
        if (errorMessage) {
            message.error(errorMessage)
            return;
        }
        return context.onConvert(scriptContentList);
    }
    const configDataSource = [...basicButtons, ...configButtons]
    return <Row style={{ marginTop: '10px' }}>
        <Col>
            <ExpandManageList />
            <ExpandAddButton lang={lang} combinationConfig={expandAddButton} refreshManage={refreshManage} />
        </Col>
        {expandButtons.map((item, key) => {
            return <Col style={{ marginLeft: '10px' }} key={key} >
                <ExpandManageButton lang={lang} combinationConfig={item} refreshManage={refreshManage} configDataSource={configDataSource} handleConvert={handleConvert} />
            </Col>
        })}
    </Row>
}

export default CombinationManage