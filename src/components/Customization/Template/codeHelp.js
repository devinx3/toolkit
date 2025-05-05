import React from 'react';
import { Button, Drawer, Typography } from 'antd';

const functionCode = `function anonymous(Util, React) {
    // 处理逻辑
    return <div>Hello, World!<div>;
}`

// 帮助文档
const helpDocument = (<>
    <Typography.Title level={3}>帮助文档</Typography.Title>
    <Typography.Title level={4}>使用介绍</Typography.Title>
    <Typography.Paragraph>方法的入参为: Util, React</Typography.Paragraph>
    <Typography.Paragraph>方法的返回值: 支持 async 的方法; Promise 对象, resolve方法的参数即为返回值, reject方法的参数即为报错提示</Typography.Paragraph>
    <Typography.Paragraph><Typography.Text code copyable>Util</Typography.Text>: 内置的工具类</Typography.Paragraph>
    <Typography.Paragraph>使用者仅仅需要实现<b>方法体</b></Typography.Paragraph>
    <Typography.Title level={5}>转换方法样例</Typography.Title>
    <div style={{ whiteSpace: 'pre-wrap' }}><Typography.Paragraph code copyable={{ text: 'return inputObj;' }}>{functionCode}</Typography.Paragraph></div>
    <br />
</>);

const toolUseDemo = `const { _, dayjs, cryptoJS, XLSX, message, importPlugin } = Util`

// 常用工具文档
const toolDocument = (<>
    <Typography.Title level={3}>常用工具</Typography.Title>
    <div style={{ whiteSpace: 'pre-wrap' }}><Typography.Paragraph code copyable>{toolUseDemo}</Typography.Paragraph></div>
    <Typography.Paragraph>
        <Typography.Title level={5}>工具库</Typography.Title>
        <Typography.Text code copyable>{`const { _ } = Util`}</Typography.Text>
        <Typography.Link style={{ marginLeft: '5px' }} href='https://www.lodashjs.com/' target="_blank">loadsh 官网</Typography.Link>
    </Typography.Paragraph>
    <Typography.Paragraph>
        <Typography.Title level={5}>日期工具</Typography.Title>
        <Typography.Text code copyable>{`const { dayjs } = Util`}</Typography.Text>
        <Typography.Link style={{ marginLeft: '5px' }} href='https://dayjs.gitee.io/zh-CN/' target="_blank">Day.js 官网</Typography.Link>
    </Typography.Paragraph>
    <Typography.Paragraph>
        <Typography.Title level={5}>加密工具</Typography.Title>
        <Typography.Text code copyable>{`const { cryptoJS } = Util`}</Typography.Text>
        <Typography.Link style={{ marginLeft: '5px' }} href='https://github.com/brix/crypto-js' target="_blank">crypto-js</Typography.Link>
    </Typography.Paragraph>
    <Typography.Paragraph>
        <Typography.Title level={5}>文件工具</Typography.Title>
        <Typography.Text code copyable>{`const { XLSX } = Util`}</Typography.Text>
        <Typography.Link style={{ marginLeft: '5px' }} href='https://github.com/rockboom/SheetJS-docs-zh-CN/' target="_blank">SheetJS 文档</Typography.Link>
    </Typography.Paragraph>
    <Typography.Paragraph>
        <Typography.Title level={5}>消息工具</Typography.Title>
        <Typography.Text code copyable>{`const { message } = Util`}</Typography.Text>
        <Typography.Text>消息提示方法，使用方式和参数如下:</Typography.Text><br />
        <Typography.Text>(content: 消息内容, duration: 自动关闭的延时, 单位秒, 设为0时不自动关闭)</Typography.Text><br />
        <Typography.Text code>message.success(content, [duration])</Typography.Text><br />
        <Typography.Text code>message.error(content, [duration])</Typography.Text><br />
        <Typography.Text code>message.info(content, [duration])</Typography.Text><br />
        <Typography.Text code>message.warning(content, [duration])</Typography.Text><br />
        <Typography.Text code>message.loading(content, [duration])</Typography.Text>
    </Typography.Paragraph>
    <Typography.Paragraph>
        <Typography.Title level={5}>导入插件(异步)</Typography.Title>
        <Typography.Text code copyable>{`const { importPlugin } = Util`}</Typography.Text><br />
        <Typography.Text code copyable>{`const { Button } = await importPlugin("antd")`}</Typography.Text>
    </Typography.Paragraph>
</>)

// Form 脚本
const FormDemo =`// 脚本执行区
const { importPlugin } = Util;
return async () => {
    // 脚本执行区(异步导入插件)
    const { Row, Col, Form, Input, Space, Button } = await importPlugin("antd");
    // 定义渲染组件
    const App = () => {
        const [content, setContent] = React.useState('');
        const [form] = Form.useForm();
        const onFinish = () => {
            const obj = form.getFieldsValue();
            setContent(JSON.stringify(obj, null, 2))
        }
        return <Row>
            <Col span={5}>
                <Form form={form} onFinish={onFinish}>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">转换</Button>

                            <Button htmlType="button" onClick={() => form.resetFields()}>重置</Button>
                        </Space>
                    </Form.Item>
                    <Form.Item label="名称" name="name"><Input /></Form.Item>
                </Form>
            </Col>
            <Col span={1} />
            <Col span={10}>
                <Input.TextArea value={content} rows={16} />
            </Col>
        </Row>
    }
    // 返回渲染组件
    return App
}`

// 样例文档
const DemoDocument = ({ title, codeDemo }) => {
    return (<>
        <Typography.Title level={3}>{title}</Typography.Title>
        <div style={{ whiteSpace: 'pre-wrap' }}><Typography.Paragraph code copyable>{codeDemo}</Typography.Paragraph></div>
    </>)
}

const HelpDrawer = ({ title, content }) => {
    const [open, setOpen] = React.useState(false);
    return <>
        <Button type='link' onClick={() => setOpen(true)}>{title}</Button>
        <Drawer title={null} placement="right" width={800} onClose={() => setOpen(false)} closeIcon={null} open={open}>
            {content}
        </Drawer>
    </>
}

const CodeHelpView = () => {
    return (<>
        <HelpDrawer title="帮助文档" content={helpDocument} />
        <HelpDrawer title="常用工具" content={toolDocument} />
        <HelpDrawer title="Form 示例文档" content={<DemoDocument title="Form 示例文档" codeDemo={FormDemo} />} />
    </>)
}

export default CodeHelpView;