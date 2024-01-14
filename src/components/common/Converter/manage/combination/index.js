import React from 'react';
import { Button, Row, Col, message } from 'antd';

import storeEditService from '../../store/storeEditService';
import { ExpandAddButton, ExpandManageButton } from './expand'
import { ScriptUtil } from '../handler';

/**
 * 获取相关分类对应的编排信息
 * @param {string} category 分类
 * @returns 根据分类加载编排
 */
const loadConfigByCategory = (category) => {
    return storeEditService.listAllConfig(category) || [];
}
/**
 * 获取相关分类对应的编排信息
 * @param {string} category 分类
 * @returns 根据分类加载编排
 */
const loadCombinationByCategory = (category) => {
    return storeEditService.listAllCombination(category) || [];
}

/**
 * 编排列表
 */
const ExpandManageList = () => {
    return <Button type='link' disabled>脚本编排</Button>
}

/**
 * 根据节点编码获取脚本内容
 * @param {语言} lang 
 * @param {基本按钮} basicButtons 
 * @param {节点编码} configCode 
 * @returns 
 */
const getScriptConfig = (category, basicButtons, configCode) => {
    if (ScriptUtil.isBasic(configCode)) {
        for (let basicButton of basicButtons) {
            if (configCode === basicButton.code) {
                return basicButton;
            }
        }
    }
    return storeEditService.queryConfigByCode(category, configCode);
}

// 脚本脚本编排
const CombinationManage = ({ lang, category, context, basicButtons, expandAddButton }) => {
    const expandButtons = loadCombinationByCategory(category) || [];
    const [refresh, setRefresh] = React.useState(false);
    const configButtons = loadConfigByCategory(category);
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
    const handleConvert = (combinationItem, codeList) => {
        if (!codeList || codeList.length === 0) {
            message.error("不存在任何节点")
            return;
        }
        let errorMessage = null;
        const combinationNode = context.createScriptEvent(combinationItem.code, combinationItem.name, null, combinationItem.version);
        let targetNode = combinationNode;
        codeList.forEach(code => {
            const scriptConfig = getScriptConfig(category, basicButtons, code);
            if (!scriptConfig) {
                errorMessage = "节点不存在";
                return null;
            } else if (!scriptConfig.scriptContent) {
                errorMessage = "脚本内容为空";
                return null;
            }
            targetNode = targetNode.add(scriptConfig.code, scriptConfig.name, scriptConfig.scriptContent, scriptConfig.version);
        })
        if (errorMessage) {
            message.error(errorMessage)
            return;
        }
        return context.onConvert(combinationNode);
    }
    const configDataSource = [...basicButtons, ...configButtons]
    return <Row style={{ marginTop: '10px' }}>
        <Col>
            <ExpandManageList />
            <ExpandAddButton category={category} combinationConfig={expandAddButton} refreshManage={refreshManage} />
        </Col>
        {expandButtons.map((item, key) => {
            return <Col style={{ marginLeft: '10px' }} key={key} >
                <ExpandManageButton category={category} combinationConfig={item} refreshManage={refreshManage} configDataSource={configDataSource} handleConvert={handleConvert} />
            </Col>
        })}
    </Row>
}

export default CombinationManage