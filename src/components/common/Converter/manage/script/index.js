import React from 'react';
import { Tooltip, Button, Row, Col } from 'antd';

import storeEditService from '../../store/storeEditService';
import { ExpandManageButton, ExpandAddButton } from './expand'
import { ScriptUtil } from '../handler';
import ExpandManageList from './list'

/**
 * 获取相关语言对应的脚本信息
 * @param {string} lang 语言
 * @returns 根据语言加载脚本
 */
const loadScriptByLang = (lang) => {
    return storeEditService.listAllConfig(lang);
}

// 脚本管理
const ScriptManage = ({ lang, context, basicButtons, expandAddButton, editorHelpRender, refreshManage }) => {
    basicButtons = ScriptUtil.convertBasicButtons(basicButtons);
    const expandButtons = expandAddButton ? loadScriptByLang(lang) : [];
    /**
     * 执行转换
     * @param {string} scriptContent 脚本内容
     * @returns 转换结果
     */
    const handleConvert = scriptContent => {
        return context.onConvert([scriptContent]);
    }
    return <>
        <Row style={{ marginTop: '10px' }}>
            {basicButtons.map((config, key) => {
                return (<Col key={key} style={{ marginLeft: '10px' }}>
                    <Tooltip title={config.description}>
                        <Button onClick={() => handleConvert(config.scriptContent)}>{config.name}</Button>
                    </Tooltip>
                </Col>)
            })}
            {expandAddButton ? <Col style={{ marginLeft: '10px' }}>
                <ExpandAddButton lang={lang} context={context} config={expandAddButton}
                    editorHelpRender={editorHelpRender} refreshScript={refreshManage} />
            </Col> : null}
        </Row>
        {expandButtons.length > 0 && (<Row style={{ marginTop: '10px' }}>
            <ExpandManageList lang={lang} dataSource={expandButtons} refreshScript={refreshManage} />
            {expandButtons.map((item, key) => {
                return (<Col key={key} style={{ marginLeft: '10px' }}>
                    <ExpandManageButton lang={lang} config={item} editorHelpRender={editorHelpRender}
                        refreshScript={refreshManage} handleConvert={handleConvert} />
                </Col>)
            })}
        </Row>)}
    </>
}

export default ScriptManage