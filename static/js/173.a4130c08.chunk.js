"use strict";(self.webpackChunktoolkit=self.webpackChunktoolkit||[]).push([[173],{82173:(e,t,n)=>{n.r(t),n.d(t,{default:()=>D});var r=n(47313),o=n(8570),a=n(52863),i=n(55291),s=n(68197),l=n(59624),c=n(45705),d=n(79036),u=n(59491),h=n(97945),p=n(93709),x=n(57325),g=n(46155),j=n(22231),v=n(66736),m=n(51678),f=n(2559),b=n(80122),y=n(571),k=n(23988),w=n(43036),Z=n(87518),S=n(61677),T=n(46417);const C=(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(o.default.Title,{level:3,children:"\u5e2e\u52a9\u6587\u6863"}),(0,T.jsx)(o.default.Title,{level:4,children:"\u4f7f\u7528\u4ecb\u7ecd"}),(0,T.jsx)(o.default.Paragraph,{children:"\u65b9\u6cd5\u7684\u5165\u53c2\u4e3a: inputData, Util"}),(0,T.jsx)(o.default.Paragraph,{children:"\u65b9\u6cd5\u7684\u8fd4\u56de\u503c: \u652f\u6301\u8fd4\u56de Promise \u5bf9\u8c61, resolve\u65b9\u6cd5\u7684\u53c2\u6570\u5373\u4e3a\u8fd4\u56de\u503c, reject\u65b9\u6cd5\u7684\u53c2\u6570\u5373\u4e3a\u62a5\u9519\u63d0\u793a"}),(0,T.jsxs)(o.default.Paragraph,{children:[(0,T.jsx)(o.default.Text,{code:!0,copyable:!0,children:"inputData"}),": \u8f93\u5165\u6570\u636e"]}),(0,T.jsxs)(o.default.Paragraph,{children:[(0,T.jsx)(o.default.Text,{code:!0,copyable:!0,children:"inputObj"}),": \u8f93\u5165\u6570\u636e\u8f6c\u6362\u7684Json\u5bf9\u8c61"]}),(0,T.jsxs)(o.default.Paragraph,{children:[(0,T.jsx)(o.default.Text,{code:!0,copyable:!0,children:"Util"}),": \u5185\u7f6e\u7684\u5de5\u5177\u7c7b"]}),(0,T.jsxs)(o.default.Paragraph,{children:["\u4f7f\u7528\u8005\u4ec5\u4ec5\u9700\u8981\u5b9e\u73b0",(0,T.jsx)("b",{children:"\u65b9\u6cd5\u4f53"})]}),(0,T.jsx)(o.default.Title,{level:5,children:"\u8f6c\u6362\u65b9\u6cd5\u6837\u4f8b"}),(0,T.jsx)("div",{style:{whiteSpace:"pre-wrap"},children:(0,T.jsx)(o.default.Paragraph,{code:!0,copyable:{text:"return inputObj;"},children:"function anonymous(inputData, Util) {\n    // \u5904\u7406\u903b\u8f91\n    return inputData;\n}"})}),(0,T.jsx)("br",{})]}),P=(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(o.default.Title,{level:3,children:"\u5e38\u7528\u5de5\u5177"}),(0,T.jsx)("div",{style:{whiteSpace:"pre-wrap"},children:(0,T.jsx)(o.default.Paragraph,{code:!0,copyable:!0,children:"const { _, dayjs, cryptoJS, XLSX, message } = Util"})}),(0,T.jsxs)(o.default.Paragraph,{children:[(0,T.jsx)(o.default.Title,{level:5,children:"\u5de5\u5177\u5e93"}),(0,T.jsx)(o.default.Text,{code:!0,copyable:!0,children:"const { _ } = Util"}),(0,T.jsx)(o.default.Link,{style:{marginLeft:"5px"},href:"https://www.lodashjs.com/",target:"_blank",children:"loadsh \u5b98\u7f51"})]}),(0,T.jsxs)(o.default.Paragraph,{children:[(0,T.jsx)(o.default.Title,{level:5,children:"\u65e5\u671f\u5de5\u5177"}),(0,T.jsx)(o.default.Text,{code:!0,copyable:!0,children:"const { dayjs } = Util"}),(0,T.jsx)(o.default.Link,{style:{marginLeft:"5px"},href:"https://dayjs.gitee.io/zh-CN/",target:"_blank",children:"Day.js \u5b98\u7f51"})]}),(0,T.jsxs)(o.default.Paragraph,{children:[(0,T.jsx)(o.default.Title,{level:5,children:"\u52a0\u5bc6\u5de5\u5177"}),(0,T.jsx)(o.default.Text,{code:!0,copyable:!0,children:"const { cryptoJS } = Util"}),(0,T.jsx)(o.default.Link,{style:{marginLeft:"5px"},href:"https://github.com/brix/crypto-js",target:"_blank",children:"crypto-js"})]}),(0,T.jsxs)(o.default.Paragraph,{children:[(0,T.jsx)(o.default.Title,{level:5,children:"\u6587\u4ef6\u5de5\u5177"}),(0,T.jsx)(o.default.Text,{code:!0,copyable:!0,children:"const { XLSX } = Util"}),(0,T.jsx)(o.default.Link,{style:{marginLeft:"5px"},href:"https://github.com/rockboom/SheetJS-docs-zh-CN/",target:"_blank",children:"SheetJS \u6587\u6863"})]}),(0,T.jsxs)(o.default.Paragraph,{children:[(0,T.jsx)(o.default.Title,{level:5,children:"\u6d88\u606f\u5de5\u5177"}),(0,T.jsx)(o.default.Text,{code:!0,copyable:!0,children:"const { message } = Util"}),(0,T.jsx)(o.default.Text,{children:"\u6d88\u606f\u63d0\u793a\u65b9\u6cd5\uff0c\u4f7f\u7528\u65b9\u5f0f\u548c\u53c2\u6570\u5982\u4e0b:"}),(0,T.jsx)("br",{}),(0,T.jsx)(o.default.Text,{children:"(content: \u6d88\u606f\u5185\u5bb9, duration: \u81ea\u52a8\u5173\u95ed\u7684\u5ef6\u65f6, \u5355\u4f4d\u79d2, \u8bbe\u4e3a0\u65f6\u4e0d\u81ea\u52a8\u5173\u95ed)"}),(0,T.jsx)("br",{}),(0,T.jsx)(o.default.Text,{code:!0,children:"message.success(content, [duration])"}),(0,T.jsx)("br",{}),(0,T.jsx)(o.default.Text,{code:!0,children:"message.error(content, [duration])"}),(0,T.jsx)("br",{}),(0,T.jsx)(o.default.Text,{code:!0,children:"message.info(content, [duration])"}),(0,T.jsx)("br",{}),(0,T.jsx)(o.default.Text,{code:!0,children:"message.warning(content, [duration])"}),(0,T.jsx)("br",{}),(0,T.jsx)(o.default.Text,{code:!0,children:"message.loading(content, [duration])"})]})]}),O=(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(o.default.Title,{level:3,children:"\u6587\u4ef6\u8bfb\u53d6"}),(0,T.jsx)("div",{style:{whiteSpace:"pre-wrap"},children:(0,T.jsx)(o.default.Paragraph,{code:!0,copyable:!0,children:"const { XLSX } = Util;\nconst readExcel = (file, callbackWorkbook) => {\n    const reader = new FileReader();\n    reader.onload = function (e) {\n        const data = e.target.result;\n        const workbook = XLSX.read(data, { \n            type: 'binary',\n            // 1252: ISO-8859-1 (\u9ed8\u8ba4\u503c)\n            // 936: \u4e2d\u6587\u7b80\u4f53\u7f16\u7801; 65001: UTF8\n            // \u5176\u4ed6\u7f16\u7801\u53c2\u8003: https://github.com/sheetjs/js-codepage#generated-codepages\n            codepage: 65001\n        });\n        callbackWorkbook(workbook)\n    };\n    reader.readAsBinaryString(file)\n}\n// \u5c06\u6307\u5b9a sheet, \u8f6c\u6362\u6210 JSON \u5bf9\u8c61\nconst getSheetJsonObj = (workbook, idx) => XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[idx]], {\n    defval: 'null'  //\u5355\u5143\u683c\u4e3a\u7a7a\u65f6\u7684\u9ed8\u8ba4\u503c\n});\nreturn new Promise((resolve, reject) => {\n    readExcel(inputData[0], workbook => {\n        try {\n            resolve(getSheetJsonObj(workbook, 0))\n        } catch (error) {\n            reject(error)\n        }\n    });\n})"})})]}),L=(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(o.default.Title,{level:3,children:"\u591a\u6587\u4ef6\u8bfb\u53d6"}),(0,T.jsx)("div",{style:{whiteSpace:"pre-wrap"},children:(0,T.jsx)(o.default.Paragraph,{code:!0,copyable:!0,children:"const { XLSX } = Util;\nconst readExcel = (file, callbackWorkbook) => {\n    const reader = new FileReader();\n    reader.onload = function (e) {\n        const data = e.target.result;\n        const workbook = XLSX.read(data, { type: 'binary', codepage: 65001 });\n        callbackWorkbook(workbook)\n    };\n    reader.readAsBinaryString(file)\n}\nconst readMutiExcel = fileList => {\n    try {\n        return Promise.all(fileList.map(file => {\n            return new Promise((resolve, reject) => {\n                try {\n                    readExcel(file, resolve);\n                } catch(error) {\n                    reject(error)\n                }\n            });\n        }));\n    } catch (error) {\n        return Promise.reject(error);\n    }\n}\n// \u5c06\u6307\u5b9a sheet, \u8f6c\u6362\u6210 JSON \u5bf9\u8c61\nconst getSheetJsonObj = (workbook, idx) => XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[idx]], {\n    defval: 'null'  //\u5355\u5143\u683c\u4e3a\u7a7a\u65f6\u7684\u9ed8\u8ba4\u503c\n});\nreturn new Promise((resolve, reject) => {\n    readMutiExcel(inputData)\n    .then(workbookList => resolve(workbookList.map(wb => getSheetJsonObj(wb, 0))))\n    .catch(reject)\n})"})})]}),N=()=>(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(S.Z,{placement:"rightTop",content:C,title:null,trigger:"click",children:(0,T.jsx)(u.Z,{type:"link",children:"\u5e2e\u52a9\u6587\u6863"})}),(0,T.jsx)(S.Z,{placement:"rightTop",content:P,title:null,trigger:"click",children:(0,T.jsx)(u.Z,{type:"link",children:"\u5e38\u7528\u5de5\u5177"})}),(0,T.jsx)(S.Z,{placement:"rightTop",content:O,title:null,trigger:"click",children:(0,T.jsx)(u.Z,{type:"link",children:"\u6587\u4ef6\u8bfb\u53d6\u6837\u4f8b"})}),(0,T.jsx)(S.Z,{placement:"rightTop",content:L,title:null,trigger:"click",children:(0,T.jsx)(u.Z,{type:"link",children:"\u591a\u6587\u4ef6\u8bfb\u53d6\u6837\u4f8b"})})]}),{Title:U}=o.default,{Dragger:_}=a.default,X=e=>{let{state:t,setCheckInputData:n}=e;const{inputData:o,setInputData:g,outputData:b,setOutputData:Z,errorMsg:S,setErrorMsg:C}=t,[P,O]=r.useState(),[L,N]=r.useState(o),U=e=>{g(e),Z(""),C("")};n((()=>!k.Z.isBlank(o)&&0!==o.length||(P?"\u8bf7\u4e0a\u4f20\u6587\u4ef6":"\u8bf7\u8f93\u5165\u6587\u672c")));return(0,T.jsxs)(s.Z,{style:{marginTop:"20px"},children:[(0,T.jsxs)(l.Z,{span:7,children:[(0,T.jsxs)(c.Z,{children:[(0,T.jsx)(d.ZP.Group,{size:"small",optionType:"button",onChange:()=>{const e=!P;O(e),N(o),U(!e||""!==L&&null!==L&&void 0!==L?L:[])},options:[{label:"\u6587\u672c",value:"0"},{label:"\u6587\u4ef6",value:"1"}],value:P?"1":"0"}),P?null:(0,T.jsx)(a.default,{maxCount:1,beforeUpload:e=>(w.Z.readAsText(e,g),!1),children:(0,T.jsx)(u.Z,{size:"small",icon:(0,T.jsx)(j.Z,{}),disabled:P,style:{marginLeft:"5px"},children:"\u5bfc\u5165"})})]}),P?(0,T.jsxs)(_,{name:"file",style:{marginTop:"5px"},multiple:!1,maxCount:3,fileList:o,beforeUpload:(e,t)=>{if(o.length>=3)return!1;const n=[...o];for(let r=0;r<t.length&&!(n.length+1>3);r++)n.push(t[r]);return U(n),a.default.LIST_IGNORE},onRemove:e=>{const t=o.filter((t=>t.uid!==e.uid));return U(t),!0},children:[(0,T.jsx)("p",{className:"ant-upload-drag-icon",children:(0,T.jsx)(v.Z,{})}),(0,T.jsx)("p",{className:"ant-upload-text",children:"\u5355\u51fb\u6216\u62d6\u52a8\u6587\u4ef6\u5230\u6b64\u533a\u57df"}),(0,T.jsx)("p",{className:"ant-upload-hint",children:"\u652f\u6301\u6279\u91cf"})]}):(0,T.jsx)(h.Z.TextArea,{autoSize:{minRows:25,maxRows:40},disabled:P,style:{marginTop:"5px"},rows:30,placeholder:P?"\u5df2\u8f93\u5165\u6587\u4ef6":"\u5f85\u5904\u7406\u7684\u6587\u672c\u7247\u6bb5",value:P?"":o,onChange:e=>{U(e.target.value)}})]}),(0,T.jsx)(l.Z,{span:10,style:{marginLeft:"30px"},children:k.Z.isBlank(S)?k.Z.isBlank(b)?null:(0,T.jsxs)(T.Fragment,{children:[(0,T.jsxs)(c.Z,{children:[(0,T.jsx)(x.Z,{title:P?"":"\u8986\u76d6\u5f85\u5904\u7406\u8f93\u5165\u6846",children:(0,T.jsx)(u.Z,{type:"text",icon:(0,T.jsx)(m.Z,{}),onClick:()=>g(b),disabled:P})}),(0,T.jsx)(y.Z,{type:"text",onClick:()=>{if(k.Z.copyToClipboard(b))return i.ZP.info("\u590d\u5236\u6210\u529f"),!0},size:"small"}),(0,T.jsx)(x.Z,{title:"\u4e0b\u8f7d",children:(0,T.jsx)(f.Z,{style:{marginLeft:"8px"},onClick:()=>{w.Z.download(b,"output.txt")}})})]}),r.isValidElement(b)?(0,T.jsx)("pre",{children:b}):(0,T.jsx)("div",{children:b})]}):(0,T.jsx)(p.Z,{message:S,type:"error"})})]})},A=e=>e.split("\n").map((e=>'"'.concat(e,'"'))).join(","),D=()=>(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(U,{level:3,children:"\u7f16\u8f91\u6587\u672c"}),(0,T.jsx)(g.Z,{}),(0,T.jsx)(b.Z,{lang:Z.b.TXT,manage:{buttons:[{code:"multiLine2Single",name:"\u591a\u884c\u8f6c\u4e00\u884c",description:"\u591a\u884c\u5408\u5e76\u6210\u4e00\u884c",scriptContent:"const _INNER_ = ".concat(A.toString(),";return _INNER_(inputData);")},{code:"originalData",name:"\u8f93\u51fa",description:"\u8f93\u51fa\u539f\u6570\u636e",scriptContent:"return inputData;"}],expandScriptButton:{name:"\u81ea\u5b9a\u4e49",description:"\u652f\u6301\u8f6c\u6362\u548c\u6dfb\u52a0\u81ea\u5b9a\u4e49\u8282\u70b9",scriptContent:"return inputData;"},editorHelpRender:N},dataBlockRender:X})]})},83770:(e,t,n)=>{n.d(t,{ep:()=>k,j5:()=>d,zn:()=>s});var r=n(66274),o=n(99359),a=n(47313),i=(0,o.Z)("next");class s{constructor(e){let{code:t,name:n,script:r,version:o}=e;Object.defineProperty(this,i,{writable:!0,value:null}),this.code=t,this.name=n,this.script=r,this.version=o||0}hasNext(){return!!(0,r.Z)(this,i)[i]}add(e,t,n,o){if(!n)throw Error("\u6dfb\u52a0\u5f02\u5e38, \u65e0\u53ef\u6267\u884c\u811a\u672c");return(0,r.Z)(this,i)[i]=new s({code:e,name:t,script:n,version:o}),(0,r.Z)(this,i)[i]}next(){return(0,r.Z)(this,i)[i]}}const l=Symbol(1);var c=(0,o.Z)("origin");class d{constructor(e){Object.defineProperty(this,c,{writable:!0,value:void 0}),(0,r.Z)(this,c)[c]=e}get(){return(0,r.Z)(this,c)[c]}static boxArea(e,t){return new d({input:e,output:t,[l]:!0})}isArea(){var e;return!0===(null===(e=(0,r.Z)(this,c)[c])||void 0===e?void 0:e[l])}}class u extends Error{}var h=(0,o.Z)("category"),p=(0,o.Z)("share"),x=(0,o.Z)("previous"),g=(0,o.Z)("stage"),j=(0,o.Z)("plugins");class v{constructor(e,t,n,o){Object.defineProperty(this,h,{writable:!0,value:"-"}),Object.defineProperty(this,p,{writable:!0,value:void 0}),Object.defineProperty(this,x,{writable:!0,value:null}),Object.defineProperty(this,g,{writable:!0,value:null}),Object.defineProperty(this,j,{writable:!0,value:{}}),(0,r.Z)(this,h)[h]=e,this.getCode=()=>t.code,this.getName=()=>t.name,(0,r.Z)(this,g)[g]=n,(0,r.Z)(this,x)[x]=o}getStageCode(){var e;return null===(e=(0,r.Z)(this,g)[g])||void 0===e?void 0:e.code}getStageName(){var e;return null===(e=(0,r.Z)(this,g)[g])||void 0===e?void 0:e.name}firstStage(){var e;return!((null===(e=(0,r.Z)(this,g)[g])||void 0===e?void 0:e.position)>0)}hasNext(){return!!(0,r.Z)(this,g)[g].nextFlag}useShare(e){return void 0!==(0,r.Z)(this,p)[p]&&null!==(0,r.Z)(this,p)[p]||((0,r.Z)(this,p)[p]=e instanceof Function?e():e),[(0,r.Z)(this,p)[p],e=>(0,r.Z)(this,p)[p]=e]}getPreviousStageOutput(){return(0,r.Z)(this,x)[x].output}addPlugin(e,t){return(0,r.Z)(this,j)[j][e]=t}getPlugin(e){return(0,r.Z)(this,j)[j][e]}}const m=(e,t)=>{const n={output:void 0},r={code:t.code,name:t.name,nextFlag:t.hasNext(),position:-1},o=new v(e,t,r,n);return{get:()=>o,nextStage:(e,t,o)=>{e&&(((e,t)=>{r.code=e.code,r.name=e.name,r.nextFlag=e.hasNext(),r.position=t})(e,t),n.output=o)}}};class f{constructor(e,t){this.invocation=null,this.source=e,this.paramNames=t||[]}compile(){const e=Function;this.invocation=new e(...this.paramNames,this.source)}execute(e,t){if(!this.invocation)throw new u("\u672a\u7f16\u8bd1\u7684\u65b9\u6cd5, \u65e0\u6cd5\u6267\u884c");return this.invocation.call(e,...t)}}const b=(()=>{const e={},t=(e,t,n)=>{let r=e[t];return void 0===r&&void 0!==n&&(r=e[t]=n),r};return{get:(n,r,o)=>{const a=t(e,n,{});return t(a,r,o)},set:(n,r,o)=>t(e,n,{})[r]=o,remove:(n,r)=>{const o=t(e,n,void 0);if(void 0!==o&&void 0!==o[r])try{delete o[r]}catch(a){o[r]=void 0}}}})();class y{constructor(e,t,n,r,o){this.category=e,this.code=t,this.sourceCode=n,this.version=r||0,this.transform=o}_compileInvocation(){if(this.transform)try{const e="function f(inputData, inputObj, Util, React) {",t="}",n=this.transform(e+this.sourceCode+t);this.sourceCode=n.substring(e.length,n.length-t.length)}catch(t){throw new u("\u7f16\u8bd1\u5931\u8d25: "+t.message)}const e=new f(this.sourceCode,["inputData","inputObj","Util","React"]);return e.compile(),e}_compileAndGetInvocation(){let e=b.get(this.category,this.code);return e&&e.v===this.version||(b[this.code]=e={},e.v=this.version),e.i?e.i:e.i=this._compileInvocation()}run(e,t,n,r){const o=n?n():void 0,i=r&&r()||{};return this._compileAndGetInvocation().execute(e,[t,o,i,this.transform?a:void 0])}}class k{constructor(e,t,n){let r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};this.options=r,this.handler=n,this.root=t,this.category=e,this.context=m(e,this.root)}nexState(e,t,n){this.context.nextStage(e,t,n)}submit(e){return(async()=>{try{const{before:t,after:n,transform:r,getUtil:o}=this.handler,{handleInputObj:i}=t(this.root,e)||{};let s;const l={input:void 0,output:void 0};let c=this.root.script?this.root:this.root.next(),u=0;for(;c;){this.nexState(c,u,s);if(s=new y(this.category,c.code,c.script,c.version,r).run(this.context.get(),e,0===u?i:null,o),s instanceof Function&&(s=s.apply(this.context.get())),s instanceof Promise&&(s=await s),s instanceof d){if(s.isArea()){const e=s.get();null!==e&&void 0!==e&&e.input&&(l.input=e.input),null!==e&&void 0!==e&&e.output&&(l.output=e.output)}}else this.options.enableJsx&&a.isValidElement(s)&&(l.output=s);c=c.next(),u++}return l.input?s=d.boxArea(l.input,l.output):l.output&&(s=new d(l.output)),n(this.root,s)}catch(s){var t,n,r,o,i;console.debug("".concat((null===(t=this.context)||void 0===t||null===(n=t.stage)||void 0===n?void 0:n.name)||(null===(r=this.root)||void 0===r?void 0:r.name)," \u6267\u884c\u5f02\u5e38"),s);const e=this.root.hasNext()?null===(o=this.context)||void 0===o||null===(i=o.stage)||void 0===i?void 0:i.name:null;let a=(s instanceof Object?s.message:s)||"";throw null===e||void 0===e?a:"".concat(e,": ").concat(a)}})()}}},87518:(e,t,n)=>{n.d(t,{b:()=>r});const r={JSON:"json",TXT:"txt",JSX:"jsx"}},80122:(e,t,n)=>{n.d(t,{Z:()=>u});var r=n(47313),o=n(87518),a=n(83770),i=n(46417);const s=r.lazy((()=>Promise.all([n.e(984),n.e(930),n.e(715),n.e(400)]).then(n.bind(n,59659)))),l=r.lazy((()=>Promise.all([n.e(984),n.e(930),n.e(182),n.e(435)]).then(n.bind(n,6945))));class c{constructor(){this.convertHandler=null}setConvertHandler(e){this.convertHandler=e}createScriptEvent(e,t,n,r){return new a.zn({code:e,name:t,script:n,version:r})}onConvert(e){if(this.convertHandler)return this.convertHandler(e);console.warn("No convert handler")}}const d={};d[o.b.JSON]=e=>e instanceof Object?e:JSON.parse(e);const u=e=>{let{lang:t="txt",category:n,manage:o,handleInputObj:a,dataBlockRender:u}=e;const h=r.useMemo((()=>new c),[]),p={...o,lang:t,category:n||t,context:h},x={lang:t,category:n||t,context:h,dataBlockRender:u,handleInputObj:a||d[t]};return(0,i.jsxs)(r.Suspense,{fallback:(0,i.jsx)(i.Fragment,{}),children:[(0,i.jsx)(s,{...p}),(0,i.jsx)(l,{...x})]})}},571:(e,t,n)=>{n.d(t,{Z:()=>d});var r=n(47313),o=n(57325),a=n(59491),i=n(71703),s=n(15275),l=n(17534),c=n(46417);const d=e=>{const[t,n]=r.useState(!1),d=l.Z.omit(e,["tipTitle"]);return(0,c.jsx)(o.Z,{title:e.tipTitle||"\u590d\u5236",children:(0,c.jsx)(a.Z,{...d,onClick:r=>{if(!t&&e.onClick){const t=e.onClick(r);return!0===t&&n(!0),t}},icon:t?(0,c.jsx)(i.Z,{style:{color:"#52c41a"}}):(0,c.jsx)(s.Z,{}),onMouseLeave:()=>{t&&n(!1)}})})}},43036:(e,t,n)=>{n.d(t,{Z:()=>r});const r={readAsText:e=>{let{file:t,handleRead:n,charset:r,handleError:o}=e;r||(r="utf8");const a=new FileReader;a.onload=()=>{n(a.result)},a.onerror=o,a.readAsText(t,r)},download:(e,t)=>{t||(t="download");let n=URL.createObjectURL(new Blob([e]));const r=document.createElement("a");r.href=n,r.setAttribute("download",t),document.body.appendChild(r),r.click(),document.body.removeChild(r)}}},17534:(e,t,n)=>{n.d(t,{X:()=>o,Z:()=>i});const r={},o={loadMonaco:"converter.loadEditor.loadMonaco.loaded"},a={getFromCache:e=>r[e],setToCache:(e,t)=>r[e]=t,getAdvanceKey:()=>"active=adv",enableAdvance:()=>(null!==r.adv&&void 0!==r.adv||(r.adv="1"===window.localStorage.getItem(a.getAdvanceKey())),!0===r.adv),setAdvance:()=>{r.adv=!0,window.localStorage.setItem(a.getAdvanceKey(),"1")},omit:(e,t)=>{const n=Object.assign({},e);for(let r=0;r<t.length;r+=1){delete n[t[r]]}return n}},i=a},23988:(e,t,n)=>{n.d(t,{Z:()=>r});const r={underlineToHump:e=>e.replace(/_(\w)/g,(function(e,t){return t.toUpperCase()})),humpToUnderline:e=>e.replace(/([A-Z])/g,"_$1").toLowerCase(),isStr:e=>"string"===typeof e,isBlank:e=>void 0===e||null===e||""===e,copyToClipboard:e=>{const t=document.createElement("textarea");t.value=e,document.body.appendChild(t),t.select();const n=document.execCommand("copy");return t.remove(),n}}}}]);