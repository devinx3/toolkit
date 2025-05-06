import React from 'react';
import { Button, Typography, Drawer } from 'antd';

const functionCode = `function anonymous(inputData, Util) {
    // 处理逻辑
    return inputData;
}`

// 帮助文档
const helpDocument = (<>
    <Typography.Title level={3}>帮助文档</Typography.Title>
    <Typography.Title level={4}>使用介绍</Typography.Title>
    <Typography.Paragraph>方法的入参为: inputData, Util</Typography.Paragraph>
    <Typography.Paragraph>方法的返回值: 支持返回 Promise 对象, resolve方法的参数即为返回值, reject方法的参数即为报错提示</Typography.Paragraph>
    <Typography.Paragraph><Typography.Text code copyable>inputData</Typography.Text>: 输入数据</Typography.Paragraph>
    <Typography.Paragraph><Typography.Text code copyable>Util</Typography.Text>: 内置的工具类</Typography.Paragraph>
    <Typography.Paragraph>使用者仅仅需要实现<b>方法体</b></Typography.Paragraph>
    <Typography.Title level={5}>转换方法样例</Typography.Title>
    <div style={{ whiteSpace: 'pre-wrap' }}><Typography.Paragraph code copyable={{ text: 'return inputObj;' }}>{functionCode}</Typography.Paragraph></div>
    <br />
</>);

const toolUseDemo = `const { _, dayjs, cryptoJS, XLSX, message } = Util`

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
</>)

// 文件读取工具
const FileDemo =
    `const { XLSX } = Util;
const readExcel = (file, callbackWorkbook) => {
    const reader = new FileReader();
    reader.onload = function (e) {
        const data = e.target.result;
        const workbook = XLSX.read(data, { 
            type: 'binary',
            // 1252: ISO-8859-1 (默认值)
            // 936: 中文简体编码; 65001: UTF8
            // 其他编码参考: https://github.com/sheetjs/js-codepage#generated-codepages
            codepage: 65001
        });
        callbackWorkbook(workbook)
    };
    reader.readAsBinaryString(file)
}
// 将指定 sheet, 转换成 JSON 对象
const getSheetJsonObj = (workbook, idx) => XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[idx]], {
    defval: 'null'  //单元格为空时的默认值
});
return new Promise((resolve, reject) => {
    readExcel(inputData[0], workbook => {
        try {
            resolve(getSheetJsonObj(workbook, 0))
        } catch (error) {
            reject(error)
        }
    });
})`

// 文件案例文档
const FileDocument = (<>
    <Typography.Title level={3}>文件读取</Typography.Title>
    <div style={{ whiteSpace: 'pre-wrap' }}><Typography.Paragraph code copyable>{FileDemo}</Typography.Paragraph></div>
</>);

// 多文件案例文档
const MutiFileDemo =
    `const { XLSX } = Util;
const readExcel = (file, callbackWorkbook) => {
    const reader = new FileReader();
    reader.onload = function (e) {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary', codepage: 65001 });
        callbackWorkbook(workbook)
    };
    reader.readAsBinaryString(file)
}
const readMutiExcel = fileList => {
    try {
        return Promise.all(fileList.map(file => {
            return new Promise((resolve, reject) => {
                try {
                    readExcel(file, resolve);
                } catch(error) {
                    reject(error)
                }
            });
        }));
    } catch (error) {
        return Promise.reject(error);
    }
}
// 将指定 sheet, 转换成 JSON 对象
const getSheetJsonObj = (workbook, idx) => XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[idx]], {
    defval: 'null'  //单元格为空时的默认值
});
return new Promise((resolve, reject) => {
    readMutiExcel(inputData)
    .then(workbookList => resolve(workbookList.map(wb => getSheetJsonObj(wb, 0))))
    .catch(reject)
})`

// 多文件案例文档
const MutiFileDocument = (<>
    <Typography.Title level={3}>多文件读取</Typography.Title>
    <div style={{ whiteSpace: 'pre-wrap' }}><Typography.Paragraph code copyable>{MutiFileDemo}</Typography.Paragraph></div>
</>);

// worker 
const WorkerDemo =
    `// 检查 Worker 可用性
if (!window.Worker) {
    throw new Error('Web Workers are not supported in this browser');
}
const createWorker = (functionRef) => {
    const blob = new Blob([\`(\${functionRef.toString()})()\`],{ type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    return {
        ref: worker,
        getResult: (data) => {
            return new Promise((resolve, reject) => {
                worker.postMessage(data);
                worker.onmessage = (e) => {
                    resolve(e.data);
                    worker.terminate();
                };
                worker.onerror = (error) => {
                    reject(error);
                    worker.terminate();
                };
            });
        }
    }
}
const worker = createWorker(() => {
    self.onmessage = function (e) {
        // worker 处理逻辑
        const data = e.data;
        const result = data.split("\\n").map(line => \`\${line}\`).join(",");
        self.postMessage(result);
    };
});
return worker.getResult(inputData);`

// Worker 使用文档
const WorkerDocument = (<>
    <Typography.Title level={3}>Worker 使用</Typography.Title>
    <div style={{ whiteSpace: 'pre-wrap' }}><Typography.Paragraph code copyable>{WorkerDemo}</Typography.Paragraph></div>
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
        <HelpDrawer title="文件读取" content={FileDocument} />
        <HelpDrawer title="多文件读取" content={MutiFileDocument} />
        <HelpDrawer title="Worker 使用" content={WorkerDocument} />
    </>)
}

export default CodeHelpView;