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
function buildPrompt({ header, framework, needDesc, dependent, componentRules, output, codeQuality }) {
  let content = header || "";
  if (framework) {
    if (header) {
      content += headPrefix;
    }
    content += "【开发框架】" + buildContent(framework);
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
  }),
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
  }),
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
  }),
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