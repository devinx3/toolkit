import React from 'react';
import { Button, Input, Popover, Typography } from 'antd';


const functionCode1 = "function functionName(inputObj, Util) {";
const functionCode2 = "// 处理逻辑"
const functionCode3 = "return inputObj;";
const functionCode4 = "}";

const dayjsUseCode = "Util.dayjs(1667042824047).format('YYYY-MM-DD HH:mm:ss'); // 2022-10-17 00:17:56";

const helpDocument = (<>
    <Typography.Title level={1}>帮助文档</Typography.Title>
    <Typography.Title level={3}>使用介绍</Typography.Title>
    <Typography.Paragraph>方法的入参为:inputObj, Util</Typography.Paragraph>
    <Typography.Paragraph>方法的返回值: 必须要和入参 inputObj 相同格式</Typography.Paragraph>
    <Typography.Paragraph><Typography.Text code copyable>inputObj</Typography.Text>: 输入数据转换的Json对象</Typography.Paragraph>
    <Typography.Paragraph><Typography.Text code copyable>Util</Typography.Text>: 内置的工具类</Typography.Paragraph>
    <Typography.Paragraph>使用者仅仅需要实现<b>方法体</b></Typography.Paragraph>
    <Typography.Title level={4}>转换方法样例</Typography.Title>
    <Typography.Paragraph code copyable={{text: functionCode3}}>
        {functionCode1}<br/>{functionCode2}<br/>{functionCode3}<br/>{functionCode4}
    </Typography.Paragraph>
    <Typography.Title level={3}>工具介绍</Typography.Title>
    <Typography.Title level={4}>日期处理样例</Typography.Title>
    <Typography.Paragraph><Typography.Link href='https://dayjs.gitee.io/zh-CN/' target="_blank">Day.js 官网</Typography.Link></Typography.Paragraph>
    <Typography.Paragraph code copyable>{dayjsUseCode}</Typography.Paragraph>
    <br/>
</>);



const CodeEditView = ({value, onChange}) => {
    return (<>
        <Popover placement="right" content={helpDocument} title={null} trigger="click"><Button type='link'>帮助文档</Button></Popover>
        <Input.TextArea style={{marginTop: '13px'}} placeholder="请输入脚本" rows={8} value={value} onChange={onChange}/>
    </>)
}

export default CodeEditView;