import React from 'react';
import { Tooltip, Button, Row, Col } from 'antd';

import storeEditService from '../../store/storeEditService';
import { ExpandManageButton, ExpandAddButton } from './expand'
import { ScriptUtil } from '../handler';
import ExpandManageList from './list'

// 鼠标移入后延时多少才显示 Tooltip，单位：秒
const tipMouseEnterDelay = 1;

/**
 * 获取相关分类对应的脚本信息
 * @param {string} category 分类
 * @returns 根据分类加载脚本
 */
const loadScriptByCategory = (category) => {
    return storeEditService.listAllConfig(category) || [];
}

// 脚本管理
const ScriptManage = ({ lang, category, context, intelligent, basicButtons, expandAddButton, editorHelpRender, refreshManage }) => {
    basicButtons = ScriptUtil.convertBasicButtons(basicButtons);
    const expandButtons = expandAddButton ? loadScriptByCategory(category) : [];
    /**
     * 执行转换
     * @param {string} scriptContent 脚本内容
     * @returns 转换结果
     */
    const handleConvert = config => {
        return context.onConvert(context.createScriptEvent(config.code, config.name, config.scriptContent, config.version));
    }
    return <>
        <Row style={{ marginTop: '10px' }}>
            {basicButtons.map((config, key) => {
                return (<Col key={key} style={{ marginLeft: '10px' }}>
                    <Tooltip title={config.description} mouseEnterDelay={tipMouseEnterDelay}>
                        <Button onClick={() => handleConvert(config)}>{config.name}</Button>
                    </Tooltip>
                </Col>)
            })}
            {expandAddButton ? <Col style={{ marginLeft: '10px' }}>
                <ExpandAddButton category={category} context={context} config={expandAddButton}
                    editorHelpRender={editorHelpRender} refreshScript={refreshManage} />
            </Col> : null}
        </Row>
        <Row style={{ marginTop: '10px' }}>
            <ExpandManageList category={category} dataSource={expandButtons} intelligent={intelligent} refreshScript={refreshManage} />
            {expandButtons.filter(item => !item.hidden).map((item, key) => {
                return (<Col key={item.code + "-" + key} style={{ marginLeft: '10px', marginTop: '5px' } }>
                    <ExpandManageButton category={category} config={item} intelligent={intelligent} editorHelpRender={editorHelpRender}
                        refreshScript={refreshManage} handleConvert={handleConvert} />
                </Col>)
            })}
        </Row>
    </>
}

export default ScriptManage