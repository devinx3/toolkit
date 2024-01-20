import React from 'react';
import { List, Typography, Divider, Form, Row, Col, Button, Input, Space, Select, message } from 'antd'
import { StorageHelper, RouteBuilder } from '../handler';
import Icon from '@ant-design/icons'
import * as icons from '@ant-design/icons'

// 获取所有 icon
const getIconList = (() => {
    let iconList = undefined;
    return () => {
        if (iconList === undefined) iconList = Object.keys(icons).filter((item) => typeof icons[item] === 'object' && item !== 'IconProvider' && item !== 'default') || [];
        return iconList
    }
})();

const Manage = () => {
    const [currentIdx, setCurrentIdx] = React.useState(null);
    const [form] = Form.useForm();
    const routes = StorageHelper.listRoutes();
    const dataSource = routes.map(x => { return { title: x.name } });
    const editRoute = (route, idx) => {
        form.setFieldsValue({ ...route });
        setCurrentIdx(idx);
    }
    const onFinish = () => {
        const icon = form.getFieldValue("icon")
        console.log("icon", icon)
        const route = RouteBuilder.builder(form.getFieldsValue());
        if (currentIdx < 0) {
            const category = form.getFieldValue("category")
            for (const item of StorageHelper.listRoutes()) {
                if (item.category === category) {
                    message.error(`新增失败, 编码${category}重复`)
                    return;
                }
            }
            StorageHelper.addRoute(route);
            message.info("新增成功");
        } else {
            StorageHelper.updateRoute(route);
            message.info("更新成功");
        }
        setCurrentIdx(null)
    }
    const onReset = () => {
        if (currentIdx >= 0) {
            form.setFieldsValue({ ...routes[currentIdx] })
        } else {
            form.resetFields();
        }
    }
    const onRemove = () => {
        StorageHelper.removeRoute(routes[currentIdx]?.category);
        setCurrentIdx(null);
        message.info("删除成功");
    }
    return <>
        <Typography.Title level={3}>定制化管理</Typography.Title>
        <Divider />
        <Row style={{ marginTop: '20px' }}>
            <Col span={5}>
                <List
                    header={<Space>
                        <Button onClick={() => window.location.reload()}>刷新</Button>
                        <Button onClick={() => form.resetFields() & setCurrentIdx(-1)}>新增</Button>
                    </Space>}
                    itemLayout="horizontal"
                    dataSource={dataSource}
                    renderItem={(item, idx) => {
                        const route = routes[idx];
                        return (<List.Item>
                            <List.Item.Meta
                                avatar={icons[route.icon] ? <Icon component={icons[route.icon]} /> : null}
                                title={<Button type='text' onClick={() => editRoute(route, idx)}><b>{route.name}</b>({route.category})</Button>}
                            />
                        </List.Item>)
                    }}
                />
            </Col>
            <Col span={1} />
            <Col span={8}>
                {(currentIdx == null) ? null : (<Form form={form} onFinish={onFinish}>
                    <Form.Item label="分类" name="category" rules={[{ required: true, min: 3, max: 12, pattern: "^[A-Za-z0-9]+$", message: "请输入字母和数字(3-12位)" }]}>
                        <Input disabled={currentIdx >= 0} />
                    </Form.Item>
                    <Form.Item label="名称" name="name" rules={[{ required: true, min: 3, max: 12, message: "请输入有效字符(3-12位)" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="图标" name="icon" rules={[{ required: true, message: "" }]}>
                        <Select showSearch allowClear >
                            {getIconList().map(item => {
                                return <Select.Option value={item} key={item}>
                                    <Icon component={icons[item]} style={{ marginRight: '8px' }} />
                                    {item}
                                </Select.Option>
                            })}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {currentIdx < 0 ? "新增" : "保存"}
                            </Button>
                            <Button htmlType="button" onClick={onReset}>
                                重置
                            </Button>
                            {currentIdx < 0 ? null : <Button htmlType="button" onClick={onRemove}>删除</Button>}
                        </Space>
                    </Form.Item>
                </Form>)}
            </Col>
        </Row>
    </>;
}

export default Manage;