# 脚本介绍与使用



## 介绍

    通过自定义脚本节点和编排，实现根据用户输入的数据进行转换，并展示所需的信息。

    **用户输入:**  可以通过文本、文件或自定义表单(定制化支持自定义UI)

    **数据转换：** 编写 JavaScript 脚本来

    **信息展示：** 展示脚本结果 (定制化支持自定义UI)



## 文本处理

        通过执行一系列脚本，从用户输入的文本(或文件)数据中提取或生成所需的结果

![文本处理](#IMAGE_PREFIX/6653fb3e-5f2f-4170-af92-b9f3971d4d61.png)

- 【多行转一行】【输出】属于预定义节点

- 【自定义】：打开自定义节点维护页

- 【导入】：读取文本文件，将文件内容，填充到输入区

- 【脚本节点】：打开脚本节点的管理页

- 【文件】：切换输入源
  
  

### 添加脚本节点

![添加脚本节点](#IMAGE_PREFIX/876a5005-a2ac-4a29-8503-d42608f54d9f.png)

- 【添加自定义节点】：保存自定义节点信息(保存到当前浏览器)

- 【执行】：立即执行脚本，并在展示在输出区(输入区必须存在内容)
  
  

### 编辑脚本节点

![文本处理](#IMAGE_PREFIX/426c87e2-ee1d-4904-9188-53f8bb4c4576.png)

- 右击脚本节点中【测试】：打开编辑菜单(支持隐藏当前节点脚本)

- 【编辑】：打开编辑节点侧弹框, 支持编辑节点名称和作用，以及节点内容

![编辑脚本节点](#IMAGE_PREFIX/e494fb80-9d6f-47c1-83ab-cd80db5ecfcd.png)

- 【关闭】：退出编辑页面(页面信息暂存，防误触)

- 【重置】：恢复到编辑前的信息
  
  

### 管理脚本节点

![管理脚本节点](#IMAGE_PREFIX/7f9992fd-4cc0-48d3-9457-5972d1380ccf.png)



- 【删除】：删除选中的脚本节点

- 【隐藏】：隐藏选中的脚本节点

- 【显示】：显示选中的脚本节点

- 【复制 JSON 节点】：复制选中的脚本节点信息 (**不支持导入**)

- 【备份】：将根据选中的脚本节点的信息，通过密钥加密后生成文件，并自动下载到本地

- 【导入】：根据url或者本地文件，导入脚本节点到当前浏览器中

- 【生成导入链接】：根据输入的 "备份文件地址" 和 "密钥" 生成导入地址
  
  

### 脚本节点签名

```javascript
function anonymous(inputData, Util) {
    // 处理逻辑
    return inputData;
}
```

```javascript
// inputData 用户输入的文本或者文件信息

// Util 定义
const Util = {
    _: require("lodash"),
    dayjs: require("dayjs"),
    cryptoJS: require("crypto-js"),
    XLSX: require("xlsx"),
    message: message,
}
```



### 脚本编排

        串联多个脚本节点以依次执行。

        **注：**仅存在自定义脚本节点才会展示。

![文本处理](#IMAGE_PREFIX/a30053d7-29d1-47f0-a98c-9533f02186e5.png)

【新建】：添加一个新的脚本编排

![脚本编排](#IMAGE_PREFIX/c76f8cf6-496b-4d35-b72e-fe73e57e243b.png)

【保存编码】：更新编码名称和作用，以及脚本节点的顺序



## JSON

    通过执行一系列脚本，从用户输入的 JSON 数据中提取或生成所需的结果

    其他配置信息参考 **文本处理**

### 脚本节点签名

```javascript
function anonymous(inputData, inputObj, Util) {
   // 处理逻辑
  return inputObj; // return inputData;
}
```

```javascript
// inputData 用户输入的 JSON 字符串信息
// inputObj  用户输入的 JSON 对象信息

// Util 定义
const Util = {
    _: require("lodash"),
    dayjs: require("dayjs"),
    cryptoJS: require("crypto-js"),
    XLSX: require("xlsx"),
    message: message,
}
```



## 定制化

    支持在定制化管理里面，新增更新和删除分类

    支持在分类页面的控制台标签，进行管理脚本节点和编排

    其他配置信息参考 **文本处理**

### 新建分类

![新建分类](#IMAGE_PREFIX/99c4d4bd-e337-4013-9414-82b008e94bb9.png)

【新增】：添加新的分类(自动在定制化页面生成一个子页面)



### 编辑脚本节点

![编辑脚本节点](#IMAGE_PREFIX/efa9ffca-6847-4d79-973a-9141b7debff4.png)

【AI】执行 ChatGpt 提示词

【更新节点】对节点名称和作用，以及脚本内容进行更新

### 脚本节点签名

```javascript
function anonymous(Util, React) {
  // importPlugin：动态导入 UI 库
  const { importPlugin } = Util;
  return (async() => {
    // 导入 antd 库
    const { Input } = await importPlugin('antd');
    const App = () => {
        // 处理逻辑
    }
    return App;
  });
}
```

```javascript
// Util 定义
const Util = {
    _: require("lodash"),
    dayjs: require("dayjs"),
    cryptoJS: require("crypto-js"),
    XLSX: require("xlsx"),
    message: message,
    importPlugin: (x) => import(x); // 当前支持 "antd" "@ant-design/icons" "@ant-design/pro-components"
}
```

## 独立页面
[示例](#/customize/page?shareData=N4IgdghgtgpiBcJAG8oX00AUhTc0FeBgwJUNVyAlCADQgAmMAzgMYBOAlgA4Au9A9mAsiiSDQywDCHZjDDMutGMwCutMAAIAPGXoA3AHwAJGABtdbYgoDqbWrrIBCJQHpVmgNwgAvkA)

#### 不同数据来源的 URI 参数
#### 分享数据
  - shareData 共享的脚本数据

#### 备份数据
  - importUrl: 备份数据地址(仅支持 HTTP GET 请求)
  - secretKey(可选): 密钥

#### [Github Gist](https://gist.github.com/devinx3)
  - githubGist: 备份数据地址
  - username(可选， 默认为devinx3): Github 用户名
  - secretKey(可选): 密钥
示例
- 元数据: https://gist.github.com/devinx3/b1c069c65fa32fa5d7cc68a9a42d85c2
- URI 参数: githubGist=b1c069c65fa32fa5d7cc68a9a42d85c2
- URI 参数(完整): githubGist=b1c069c65fa32fa5d7cc68a9a42d85c2&username=devinx3&secretKey=

#### [dpaste](https://dpaste.com)
  - dpasteItemId: dpaste 网站 ITEM_ID
  - secretKey(可选): 密钥
示例
- 元数据: https://dpaste.com/FXX8WGGJF
- URI 参数: dpasteItemId=FXX8WGGJF