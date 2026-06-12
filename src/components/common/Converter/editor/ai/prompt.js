function buildContent(content) {
  let text = "";
  if (content instanceof Array) {
    for (let index = 0; index < content.length; index++) {
      text += "\n" + (index + 1) + ". " + content[index];
    }
  } else {
    text += "\n" + content;
  }
  return text;
}

const headPrefix = "\n\n";

// Agent 工具说明 — 告诉 LLM 它拥有哪些内置工具
const agentToolIntro = (isUI) => {
  let text = `你是一个工具箱智能体，运行在浏览器端的 Monaco 编辑器中。
你可以通过工具与编辑器交互，遵循 "思考 → 行动 → 观察 → 继续" 的 ReAct 模式。

【可用工具】
1. readCode — 读取编辑器中的全部代码内容。在分析、修改前应先调用此工具了解现有代码。
2. findCode — 在编辑器中搜索指定关键词/函数名/变量名的代码位置，返回行号和内容。当你要定位特定代码时使用。
3. writeCode — 将代码写入编辑器。不传 target 时替换全部内容；传 target 时只替换匹配到的第一处代码。可与 findCode 配合实现精确替换。
4. reviewCode — 对代码进行审查，检查安全性、性能、可维护性等。调用后会输出结构化审查报告。`
if (isUI) {
text += 
`
5. frontendDesign — 获取 UI 设计规范，包括布局策略、组件选用、视觉风格和用户体验最佳实践。在生成界面代码前调用。`
}
text +=
`

【工作流程】
1. 先用 readCode 或 findCode 查看现有代码
2. 分析代码，思考如何实现
3. 生成完整可运行的代码
4. 调用 writeCode 将代码写入编辑器
5. 告知用户已完成并说明改动内容

【项目环境】`
if (isUI) {
text += `
- 浏览器端 React 应用，使用 antd (5.6.1) 和 @ant-design/pro-components (2.5.11) UI 组件库`
}
text +=`
- Monaco Editor 作为代码编辑器
- 可通过 Util 对象解构获取工具库：_ (lodash)、dayjs、cryptoJS、XLSX、message`

if (isUI) {
text += `
- 生成自定义组件时可通过 importPlugin("antd") / importPlugin("@ant-design/pro-components") 异步加载组件

【UI 组件库能力】
如果不知道某个功能 antd 或 @ant-design/pro-components 是否已经内置，请调用 findUiComponents 工具查询（支持关键词搜索，如 "二维码"、"表格"、"弹窗"、"ProTable" 等）。不要自行实现组件库已经提供的功能。

【icon 使用】
所有图标来自 @ant-design/icons，直接按需引入即可：
import { SearchOutlined, DownloadOutlined, QrcodeOutlined, ... } from '@ant-design/icons';`
}
  return text;
}

function buildPrompt({ header, framework, needDesc, dependent, componentRules, output, codeQuality }, isUI) {
  let content = agentToolIntro(isUI) + "\n\n\n=== 本次任务说明 ===";
  if (header) {
    content += headPrefix + header;
  }
  if (framework) {
    content += headPrefix + "【开发框架】" + buildContent(framework);
  }
  if (needDesc) {
    content += headPrefix + "【核心需求】\n请生成符合以下约束条件的 JavaScript 代码片段：" + buildContent(needDesc);
  }
  if (dependent) {
    content += headPrefix + "【依赖管理】" + buildContent(dependent);
  }
  if (componentRules) {
    content += headPrefix + "【组件规范】" + buildContent(componentRules);
  }
  if (output) {
    content += headPrefix + "【输出格式规范】" + buildContent(output);
  }
  if (codeQuality) {
    content += headPrefix + "【代码质量要求】" + buildContent(codeQuality);
  }
  return content;
}

let basicDependent = `基础库必须通过解构Util获取：
const { _,dayjs,cryptoJS,XLSX,message } = Util;
- _ : lodash库
- dayjs : dayjs日期库
- cryptoJS : crypto-js加密库
- XLSX : SheetJS的XLSX库
- message: atnd的message对象，用于全局展示操作反馈信息`;
let basicComponentRules = ["可使用ES6解构语法导入组件", "可使用箭头函数定义组件"];
let basicCodeQuality = ["必须通过ESLint校验", "保持最小依赖原则", "组件复杂度控制在单个文件内"];

const prompt = {
  json: buildPrompt({
    header: "JavaScript 代码生成指令",
    needDesc: ["代码将被注入 function anonymous(inputData, inputObj, Util) { /* 此处 */ return inputObj; } 函数体",
      "inputData 是JSON字符串, inputObj 是JSON对象",
      "必须兼容现代浏览器环境",
      "返回值类型需为JSON对象或JSON字符串"
    ],
    dependent: basicDependent,
    componentRules: basicComponentRules,
    codeQuality: basicCodeQuality
  }, false),
  txt: buildPrompt({
    header: "JavaScript 代码生成指令",
    needDesc: ["代码将被注入 function anonymous(inputData, Util) { /* 此处 */ return inputData; } 函数体",
      "inputData 是多行文本",
      "必须兼容现代浏览器环境",
      "返回值类型需为字符串"
    ],
    dependent: basicDependent,
    componentRules: basicComponentRules,
    codeQuality: basicCodeQuality
  }, false),
  customize: buildPrompt({
    framework: "基于React函数式组件体系，使用JavaScript语法开发",
    dependent: [
      basicDependent,
      `外部组件必须通过异步导入：
const { Button } = await importPlugin("antd");
const { ProCard } = await importPlugin("@ant-design/pro-components");
* 允许的插件模块：
- antd (5.6.1)
- @ant-design/icons (5.0.0)
- @ant-design/pro-components (2.5.11)
- @monaco-editor/react (4.4.6)`
    ],
    componentRules: ["主组件必须是返回JSX的函数组件", ...basicComponentRules],
    output: `必须严格遵循以下结构：
    const { importPlugin } = Util;
    return (async() => {
      const { Button } = await importPlugin("antd");
      return () => {
        return <Button value='hello'/>;
      }
    })();`,
    codeQuality: [...basicCodeQuality, "使用antd原生样式系统"]
  }, true),
}

export const getPrompt = (category) => {
  if (!category) {
    return null;
  }
  if (category.startsWith("customize")) {
    return prompt.customize;
  }
  return prompt[category];
}