import React from 'react';
import { Button, Input, Popover, Typography } from 'antd';

const functionCode = `function functionName(inputObj, Util) {
    // 处理逻辑
    return inputObj;
}`

// 帮助文档
const helpDocument = (<>
    <Typography.Title level={1}>帮助文档</Typography.Title>
    <Typography.Title level={3}>使用介绍</Typography.Title>
    <Typography.Paragraph>方法的入参为:inputObj, Util</Typography.Paragraph>
    <Typography.Paragraph>方法的返回值: 必须要和入参 inputObj 相同格式</Typography.Paragraph>
    <Typography.Paragraph><Typography.Text code copyable>inputObj</Typography.Text>: 输入数据转换的Json对象</Typography.Paragraph>
    <Typography.Paragraph><Typography.Text code copyable>Util</Typography.Text>: 内置的工具类</Typography.Paragraph>
    <Typography.Paragraph>使用者仅仅需要实现<b>方法体</b></Typography.Paragraph>
    <Typography.Title level={4}>转换方法样例</Typography.Title>
    <div style={{whiteSpace: 'pre-wrap'}}><Typography.Paragraph code copyable={{text: 'return inputObj;'}}>{functionCode}</Typography.Paragraph></div>
    <br/>
</>);

// 创建 dayjs 的代码实例
const dayjsCreateDemo = 
`// 创建当前日期对象
const now = Util.dayjs(); 
// 使用 JavaScript Date 对象创建
// 等价 Util.dayjs(new Date());
// 使用时间戳(毫秒)创建
// 等价 Util.dayjs(Date.now());
// 使用日期字符串创建日期对象
const date = Util.dayjs('2022-10-24 10:24:10.240');`;

// 使用 dayjs 的代码实例
const dayjsUseDemo = 
`// 格式化当前时间
Util.dayjs().format('YYYY-MM-DD HH:mm:ss.SSS');
// 设置和查询秒
Util.dayjs().second(30); // => new Date().setSeconds(30)
Util.dayjs().second(); // => new Date().getSeconds()
// 返回指定单位下两个日期时间之间的差异 (默认单位是毫秒)
Util.dayjs().diff(Util.dayjs('2022-10-24'))
// 转换为 JavaScript Date 对象
Util.dayjs('2022-10-24').toDate()`;

// 日期工具文档
const dateDocument = (<>
    <Typography.Title level={3}>日期工具</Typography.Title>
    <Typography.Paragraph><Typography.Link href='https://dayjs.gitee.io/zh-CN/' target="_blank">Day.js 官网</Typography.Link></Typography.Paragraph>
    <Typography.Title level={5}>创建</Typography.Title>
    <div style={{whiteSpace: 'pre-wrap'}}><Typography.Paragraph code>{dayjsCreateDemo}</Typography.Paragraph></div>
    <Typography.Title level={5}>使用</Typography.Title>
    <div style={{whiteSpace: 'pre-wrap'}}><Typography.Paragraph code>{dayjsUseDemo}</Typography.Paragraph></div>
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
    if (current.constructor === Object) {
        for (let key in current) {
            const newObj = traverseObj(current[key], {key: key, val: current});
            if (parent) {
                current[key] = newObj;
            }
        }
    } else if (current.constructor === Array) {
        for (let index = 0; index < current.length; index++) {
            current[index] = traverseObj(current[index], {key: parent && parent.key, val: current, index: index});
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
    <div style={{whiteSpace: 'pre-wrap'}}><Typography.Paragraph code copyable>{traverseObjDemo}</Typography.Paragraph></div>
</>);


const CodeEditView = ({value, onChange}) => {
    return (<>
        <Popover placement="rightTop" content={helpDocument} title={null} trigger="click"><Button type='link'>帮助文档</Button></Popover>
        <Popover placement="rightTop" content={dateDocument} title={null} trigger="click"><Button type='link'>日期工具</Button></Popover>
        <Popover placement="rightTop" content={traverseDocument} title={null} trigger="click"><Button type='link'>遍历对象</Button></Popover>
        <Input.TextArea style={{marginTop: '13px'}} placeholder="请输入脚本" rows={8} value={value} onChange={onChange}/>
    </>)
}

export default CodeEditView;