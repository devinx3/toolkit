import React from 'react';
import { Button, Drawer, Typography } from 'antd';

const functionCode = `function anonymous(inputData, inputObj, Util) {
    // 处理逻辑
    return inputData;
}`

// 帮助文档
const helpDocument = (<>
    <Typography.Title level={3}>帮助文档</Typography.Title>
    <Typography.Title level={4}>使用介绍</Typography.Title>
    <Typography.Paragraph>方法的入参为:inputData, inputObj, Util</Typography.Paragraph>
    <Typography.Paragraph>方法的返回值: 如果返回 Object, 将会被转换成字符串</Typography.Paragraph>
    <Typography.Paragraph><Typography.Text code copyable>inputData</Typography.Text>: 输入数据</Typography.Paragraph>
    <Typography.Paragraph><Typography.Text code copyable>inputObj</Typography.Text>: 输入数据转换的Json对象</Typography.Paragraph>
    <Typography.Paragraph><Typography.Text code copyable>Util</Typography.Text>: 内置的工具类</Typography.Paragraph>
    <Typography.Paragraph>使用者仅仅需要实现<b>方法体</b></Typography.Paragraph>
    <Typography.Title level={5}>转换方法样例</Typography.Title>
    <div style={{ whiteSpace: 'pre-wrap' }}><Typography.Paragraph code copyable={{ text: 'return inputObj;' }}>{functionCode}</Typography.Paragraph></div>
    <br />
</>);


const toolUseDemo = `const { _, dayjs, message } = Util`

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
        {/* <Typography.Text>消息工具</Typography.Text> */}
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
</>)

// 遍历对象代码
const traverseObjDemo =
    `/**
 * 遍历对象, 并修改字段和值
 * @param current       输入对象
 * @param parent        父级对象; 若为空, 则认为是顶级; {key, val, index} 
 * @returns 处理后的对象
 */
const traverseObj = (current, parent) => {
    if (current === undefined || current === null) {
        return current;
    }
    if (current.constructor === Array) {
        for (let index = 0; index < current.length; index++) {
            current[index] = traverseObj(current[index], {key: parent && parent.key, val: current, index: index});
        }
    } else if (current.constructor === Object) {
        for (let key in current) {
            const newObj = traverseObj(current[key], {key: key, val: current});
            if (parent) {
                current[key] = newObj;
            }
        }
    }
    // 逻辑处理 TODO
    return current;
};
console.log("inputObj", inputObj);
return traverseObj(inputObj);`;


// 遍历对象
const traverseDocument = (<>
    <Typography.Title level={3}>遍历对象</Typography.Title>
    <div style={{ whiteSpace: 'pre-wrap' }}><Typography.Paragraph code copyable>{traverseObjDemo}</Typography.Paragraph></div>
</>);

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
        <HelpDrawer title="遍历对象样例" content={traverseDocument} />
    </>)
}

export default CodeHelpView;