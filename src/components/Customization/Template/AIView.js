import React from 'react';
import { Button, Typography } from 'antd';

const chatGptPrompt = `你是一位擅长使用 JavaScript 的资深工程师，我需要你根据以下要求，生成代码：
代码案例:
    const { importPlugin } = Util;
    return (async() {
        // #1 在这里导入包
        const App = () => {
            // #2 在这里实现页面
            return (<></>);
        }
        return App;
    }
说明:
    变量 "Util._" 导入了 lodash 库;
    变量 "Util.dayjs" 导入了 dayjs 库;
    变量 "Util.cryptoJS" 导入了 crypto-js 库;
    变量 "Util.XLSX" 导入了 SheetJS 的 XLSX 库。
要求: 
    仅仅返回代码(不要输出#1和#2的注释), 都不需要其他任何回答;
    注意可以直接使用的全局变量为 React(不允许使用 importPlugin 导入);
    注意 importPlugin 仅仅在 async 方法内部使用, 并且返回的是模块的Promise;
    当输入 "导包" 时，在 #1 中导入需要的包(使用importPlugin替换关键字import);
    当输入 "需求" 时, 按照要求在 #2 中完成。

此次描述只回答是否明白`;


const AIView = () => {
    return (<>
        <Button href='https://chatgpt.com' target='_blank' type='link'>ChatGPT</Button>
        <Typography.Text copyable={{text: chatGptPrompt}} >提示词</Typography.Text>
    </>)
}

export default AIView;