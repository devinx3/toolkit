"use strict";(self.webpackChunktoolkit=self.webpackChunktoolkit||[]).push([[173],{82173:(e,t,n)=>{n.r(t),n.d(t,{default:()=>_});var l=n(47313),a=n(7432),r=n(18708),s=n(67407),o=n(68197),i=n(59624),c=n(46968),d=n(79036),u=n(23232),p=n(66672),h=n(44730),x=n(61763),j=n(87785),g=n(22231),m=n(66736),f=n(23495),b=n(6986),v=n(80122),y=n(571),k=n(23988),w=n(43036),T=n(87518),Z=n(61677),S=n(46417);const P=(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(a.default.Title,{level:3,children:"\u5e2e\u52a9\u6587\u6863"}),(0,S.jsx)(a.default.Title,{level:4,children:"\u4f7f\u7528\u4ecb\u7ecd"}),(0,S.jsx)(a.default.Paragraph,{children:"\u65b9\u6cd5\u7684\u5165\u53c2\u4e3a: inputData, Util"}),(0,S.jsx)(a.default.Paragraph,{children:"\u65b9\u6cd5\u7684\u8fd4\u56de\u503c: \u652f\u6301\u8fd4\u56de Promise \u5bf9\u8c61, resolve\u65b9\u6cd5\u7684\u53c2\u6570\u5373\u4e3a\u8fd4\u56de\u503c, reject\u65b9\u6cd5\u7684\u53c2\u6570\u5373\u4e3a\u62a5\u9519\u63d0\u793a"}),(0,S.jsxs)(a.default.Paragraph,{children:[(0,S.jsx)(a.default.Text,{code:!0,copyable:!0,children:"inputData"}),": \u8f93\u5165\u6570\u636e"]}),(0,S.jsxs)(a.default.Paragraph,{children:[(0,S.jsx)(a.default.Text,{code:!0,copyable:!0,children:"inputObj"}),": \u8f93\u5165\u6570\u636e\u8f6c\u6362\u7684Json\u5bf9\u8c61"]}),(0,S.jsxs)(a.default.Paragraph,{children:[(0,S.jsx)(a.default.Text,{code:!0,copyable:!0,children:"Util"}),": \u5185\u7f6e\u7684\u5de5\u5177\u7c7b"]}),(0,S.jsxs)(a.default.Paragraph,{children:["\u4f7f\u7528\u8005\u4ec5\u4ec5\u9700\u8981\u5b9e\u73b0",(0,S.jsx)("b",{children:"\u65b9\u6cd5\u4f53"})]}),(0,S.jsx)(a.default.Title,{level:5,children:"\u8f6c\u6362\u65b9\u6cd5\u6837\u4f8b"}),(0,S.jsx)("div",{style:{whiteSpace:"pre-wrap"},children:(0,S.jsx)(a.default.Paragraph,{code:!0,copyable:{text:"return inputObj;"},children:"function anonymous(inputData, Util) {\n    // \u5904\u7406\u903b\u8f91\n    return inputData;\n}"})}),(0,S.jsx)("br",{})]}),C=(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(a.default.Title,{level:3,children:"\u5e38\u7528\u5de5\u5177"}),(0,S.jsx)("div",{style:{whiteSpace:"pre-wrap"},children:(0,S.jsx)(a.default.Paragraph,{code:!0,copyable:!0,children:"const { _, dayjs, cryptoJS, XLSX, message } = Util"})}),(0,S.jsxs)(a.default.Paragraph,{children:[(0,S.jsx)(a.default.Title,{level:5,children:"\u5de5\u5177\u5e93"}),(0,S.jsx)(a.default.Text,{code:!0,copyable:!0,children:"const { _ } = Util"}),(0,S.jsx)(a.default.Link,{style:{marginLeft:"5px"},href:"https://www.lodashjs.com/",target:"_blank",children:"loadsh \u5b98\u7f51"})]}),(0,S.jsxs)(a.default.Paragraph,{children:[(0,S.jsx)(a.default.Title,{level:5,children:"\u65e5\u671f\u5de5\u5177"}),(0,S.jsx)(a.default.Text,{code:!0,copyable:!0,children:"const { dayjs } = Util"}),(0,S.jsx)(a.default.Link,{style:{marginLeft:"5px"},href:"https://dayjs.gitee.io/zh-CN/",target:"_blank",children:"Day.js \u5b98\u7f51"})]}),(0,S.jsxs)(a.default.Paragraph,{children:[(0,S.jsx)(a.default.Title,{level:5,children:"\u52a0\u5bc6\u5de5\u5177"}),(0,S.jsx)(a.default.Text,{code:!0,copyable:!0,children:"const { cryptoJS } = Util"}),(0,S.jsx)(a.default.Link,{style:{marginLeft:"5px"},href:"https://github.com/brix/crypto-js",target:"_blank",children:"crypto-js"})]}),(0,S.jsxs)(a.default.Paragraph,{children:[(0,S.jsx)(a.default.Title,{level:5,children:"\u6587\u4ef6\u5de5\u5177"}),(0,S.jsx)(a.default.Text,{code:!0,copyable:!0,children:"const { XLSX } = Util"}),(0,S.jsx)(a.default.Link,{style:{marginLeft:"5px"},href:"https://github.com/rockboom/SheetJS-docs-zh-CN/",target:"_blank",children:"SheetJS \u6587\u6863"})]}),(0,S.jsxs)(a.default.Paragraph,{children:[(0,S.jsx)(a.default.Title,{level:5,children:"\u6d88\u606f\u5de5\u5177"}),(0,S.jsx)(a.default.Text,{code:!0,copyable:!0,children:"const { message } = Util"}),(0,S.jsx)(a.default.Text,{children:"\u6d88\u606f\u63d0\u793a\u65b9\u6cd5\uff0c\u4f7f\u7528\u65b9\u5f0f\u548c\u53c2\u6570\u5982\u4e0b:"}),(0,S.jsx)("br",{}),(0,S.jsx)(a.default.Text,{children:"(content: \u6d88\u606f\u5185\u5bb9, duration: \u81ea\u52a8\u5173\u95ed\u7684\u5ef6\u65f6, \u5355\u4f4d\u79d2, \u8bbe\u4e3a0\u65f6\u4e0d\u81ea\u52a8\u5173\u95ed)"}),(0,S.jsx)("br",{}),(0,S.jsx)(a.default.Text,{code:!0,children:"message.success(content, [duration])"}),(0,S.jsx)("br",{}),(0,S.jsx)(a.default.Text,{code:!0,children:"message.error(content, [duration])"}),(0,S.jsx)("br",{}),(0,S.jsx)(a.default.Text,{code:!0,children:"message.info(content, [duration])"}),(0,S.jsx)("br",{}),(0,S.jsx)(a.default.Text,{code:!0,children:"message.warning(content, [duration])"}),(0,S.jsx)("br",{}),(0,S.jsx)(a.default.Text,{code:!0,children:"message.loading(content, [duration])"})]})]}),N=(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(a.default.Title,{level:3,children:"\u6587\u4ef6\u8bfb\u53d6"}),(0,S.jsx)("div",{style:{whiteSpace:"pre-wrap"},children:(0,S.jsx)(a.default.Paragraph,{code:!0,copyable:!0,children:"const { XLSX } = Util;\nconst readExcel = (file, callbackWorkbook) => {\n    const reader = new FileReader();\n    reader.onload = function (e) {\n        const data = e.target.result;\n        const workbook = XLSX.read(data, { \n            type: 'binary',\n            // 1252: ISO-8859-1 (\u9ed8\u8ba4\u503c)\n            // 936: \u4e2d\u6587\u7b80\u4f53\u7f16\u7801; 65001: UTF8\n            // \u5176\u4ed6\u7f16\u7801\u53c2\u8003: https://github.com/sheetjs/js-codepage#generated-codepages\n            codepage: 65001\n        });\n        callbackWorkbook(workbook)\n    };\n    reader.readAsBinaryString(file)\n}\n// \u5c06\u6307\u5b9a sheet, \u8f6c\u6362\u6210 JSON \u5bf9\u8c61\nconst getSheetJsonObj = (workbook, idx) => XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[idx]], {\n    defval: 'null'  //\u5355\u5143\u683c\u4e3a\u7a7a\u65f6\u7684\u9ed8\u8ba4\u503c\n});\nreturn new Promise((resolve, reject) => {\n    readExcel(inputData[0], workbook => {\n        try {\n            resolve(getSheetJsonObj(workbook, 0))\n        } catch (error) {\n            reject(error)\n        }\n    });\n})"})})]}),L=(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(a.default.Title,{level:3,children:"\u591a\u6587\u4ef6\u8bfb\u53d6"}),(0,S.jsx)("div",{style:{whiteSpace:"pre-wrap"},children:(0,S.jsx)(a.default.Paragraph,{code:!0,copyable:!0,children:"const { XLSX } = Util;\nconst readExcel = (file, callbackWorkbook) => {\n    const reader = new FileReader();\n    reader.onload = function (e) {\n        const data = e.target.result;\n        const workbook = XLSX.read(data, { type: 'binary', codepage: 65001 });\n        callbackWorkbook(workbook)\n    };\n    reader.readAsBinaryString(file)\n}\nconst readMutiExcel = fileList => {\n    try {\n        return Promise.all(fileList.map(file => {\n            return new Promise((resolve, reject) => {\n                try {\n                    readExcel(file, resolve);\n                } catch(error) {\n                    reject(error)\n                }\n            });\n        }));\n    } catch (error) {\n        return Promise.reject(error);\n    }\n}\n// \u5c06\u6307\u5b9a sheet, \u8f6c\u6362\u6210 JSON \u5bf9\u8c61\nconst getSheetJsonObj = (workbook, idx) => XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[idx]], {\n    defval: 'null'  //\u5355\u5143\u683c\u4e3a\u7a7a\u65f6\u7684\u9ed8\u8ba4\u503c\n});\nreturn new Promise((resolve, reject) => {\n    readMutiExcel(inputData)\n    .then(workbookList => resolve(workbookList.map(wb => getSheetJsonObj(wb, 0))))\n    .catch(reject)\n})"})})]}),O=()=>(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(Z.Z,{placement:"rightTop",content:P,title:null,trigger:"click",children:(0,S.jsx)(u.ZP,{type:"link",children:"\u5e2e\u52a9\u6587\u6863"})}),(0,S.jsx)(Z.Z,{placement:"rightTop",content:C,title:null,trigger:"click",children:(0,S.jsx)(u.ZP,{type:"link",children:"\u5e38\u7528\u5de5\u5177"})}),(0,S.jsx)(Z.Z,{placement:"rightTop",content:N,title:null,trigger:"click",children:(0,S.jsx)(u.ZP,{type:"link",children:"\u6587\u4ef6\u8bfb\u53d6\u6837\u4f8b"})}),(0,S.jsx)(Z.Z,{placement:"rightTop",content:L,title:null,trigger:"click",children:(0,S.jsx)(u.ZP,{type:"link",children:"\u591a\u6587\u4ef6\u8bfb\u53d6\u6837\u4f8b"})})]}),{Title:E}=a.default,{Dragger:X}=r.default,D=e=>{let{state:t,setCheckInputData:n}=e;const{inputData:a,setInputData:j,outputData:v,setOutputData:T,errorMsg:Z,setErrorMsg:P}=t,[C,N]=l.useState(),[L,O]=l.useState(a),E=e=>{j(e),T(""),P("")};n((()=>!k.Z.isBlank(a)&&0!==a.length||(C?"\u8bf7\u4e0a\u4f20\u6587\u4ef6":"\u8bf7\u8f93\u5165\u6587\u672c")));return(0,S.jsxs)(o.Z,{style:{marginTop:"20px"},children:[(0,S.jsxs)(i.Z,{span:7,children:[(0,S.jsxs)(c.Z,{children:[(0,S.jsx)(d.ZP.Group,{size:"small",optionType:"button",onChange:()=>{const e=!C;N(e),O(a),E(!e||""!==L&&null!==L&&void 0!==L?L:[])},options:[{label:"\u6587\u672c",value:"0"},{label:"\u6587\u4ef6",value:"1"}],value:C?"1":"0"}),C?null:(0,S.jsx)(r.default,{maxCount:1,beforeUpload:e=>(w.Z.readAsText(e,j),!1),children:(0,S.jsx)(u.ZP,{size:"small",icon:(0,S.jsx)(g.Z,{}),disabled:C,style:{marginLeft:"5px"},children:"\u5bfc\u5165"})})]}),C?(0,S.jsxs)(X,{name:"file",style:{marginTop:"5px"},multiple:!1,maxCount:3,fileList:a,beforeUpload:(e,t)=>{if(a.length>=3)return!1;const n=[...a];for(let l=0;l<t.length&&!(n.length+1>3);l++)n.push(t[l]);return E(n),r.default.LIST_IGNORE},onRemove:e=>{const t=a.filter((t=>t.uid!==e.uid));return E(t),!0},children:[(0,S.jsx)("p",{className:"ant-upload-drag-icon",children:(0,S.jsx)(m.Z,{})}),(0,S.jsx)("p",{className:"ant-upload-text",children:"\u5355\u51fb\u6216\u62d6\u52a8\u6587\u4ef6\u5230\u6b64\u533a\u57df"}),(0,S.jsx)("p",{className:"ant-upload-hint",children:"\u652f\u6301\u6279\u91cf"})]}):(0,S.jsx)(p.Z.TextArea,{autoSize:{minRows:25,maxRows:40},disabled:C,style:{marginTop:"5px"},rows:30,placeholder:C?"\u5df2\u8f93\u5165\u6587\u4ef6":"\u5f85\u5904\u7406\u7684\u6587\u672c\u7247\u6bb5",value:C?"":a,onChange:e=>{E(e.target.value)}})]}),(0,S.jsx)(i.Z,{span:10,style:{marginLeft:"30px"},children:k.Z.isBlank(Z)?k.Z.isBlank(v)?null:(0,S.jsxs)(S.Fragment,{children:[(0,S.jsxs)(c.Z,{children:[(0,S.jsx)(x.Z,{title:C?"":"\u8986\u76d6\u5f85\u5904\u7406\u8f93\u5165\u6846",children:(0,S.jsx)(u.ZP,{type:"text",icon:(0,S.jsx)(f.Z,{}),onClick:()=>j(v),disabled:C})}),(0,S.jsx)(y.Z,{type:"text",onClick:()=>{if(k.Z.copyToClipboard(v))return s.ZP.info("\u590d\u5236\u6210\u529f"),!0},size:"small"}),(0,S.jsx)(x.Z,{title:"\u4e0b\u8f7d",children:(0,S.jsx)(b.Z,{style:{marginLeft:"8px"},onClick:()=>{w.Z.download(v,"output.txt")}})})]}),l.isValidElement(v)?(0,S.jsx)("div",{children:v}):(0,S.jsx)("pre",{children:v})]}):(0,S.jsx)(h.Z,{message:Z,type:"error"})})]})},U=e=>e.split("\n").map((e=>'"'.concat(e,'"'))).join(","),_=()=>(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(E,{level:3,children:"\u7f16\u8f91\u6587\u672c"}),(0,S.jsx)(j.Z,{}),(0,S.jsx)(v.Z,{lang:T.bn.TXT,manage:{buttons:[{code:"multiLine2Single",name:"\u591a\u884c\u8f6c\u4e00\u884c",description:"\u591a\u884c\u5408\u5e76\u6210\u4e00\u884c",scriptContent:"const _INNER_ = ".concat(U.toString(),";return _INNER_(inputData);")},{code:"originalData",name:"\u8f93\u51fa",description:"\u8f93\u51fa\u539f\u6570\u636e",scriptContent:"return inputData;"}],expandScriptButton:{name:"\u81ea\u5b9a\u4e49",description:"\u652f\u6301\u8f6c\u6362\u548c\u6dfb\u52a0\u81ea\u5b9a\u4e49\u8282\u70b9",scriptContent:"return inputData;"},editorHelpRender:O},dataBlockRender:D})]})},571:(e,t,n)=>{n.d(t,{Z:()=>d});var l=n(47313),a=n(61763),r=n(23232),s=n(43681),o=n(66407),i=n(17534),c=n(46417);const d=e=>{const[t,n]=l.useState(!1),d=i.Z.omit(e,["tipTitle"]);return(0,c.jsx)(a.Z,{title:e.tipTitle||"\u590d\u5236",children:(0,c.jsx)(r.ZP,{...d,onClick:l=>{if(!t&&e.onClick){const t=e.onClick(l);return!0===t&&n(!0),t}},icon:t?(0,c.jsx)(s.Z,{style:{color:"#52c41a"}}):(0,c.jsx)(o.Z,{}),onMouseLeave:()=>{t&&n(!1)}})})}},43036:(e,t,n)=>{n.d(t,{Z:()=>l});const l={readAsText:e=>{let{file:t,handleRead:n,charset:l,handleError:a}=e;l||(l="utf8");const r=new FileReader;r.onload=()=>{n(r.result)},r.onerror=a,r.readAsText(t,l)},download:(e,t)=>{t||(t="download");let n=URL.createObjectURL(new Blob([e]));const l=document.createElement("a");l.href=n,l.setAttribute("download",t),document.body.appendChild(l),l.click(),document.body.removeChild(l)}}},17534:(e,t,n)=>{n.d(t,{X:()=>a,Z:()=>s});const l={},a={loadMonaco:"converter.loadEditor.loadMonaco.loaded"},r={getFromCache:e=>l[e],setToCache:(e,t)=>l[e]=t,getAdvanceKey:()=>"active=adv",enableAdvance:()=>(null!==l.adv&&void 0!==l.adv||(l.adv="1"===window.localStorage.getItem(r.getAdvanceKey())),!0===l.adv),setAdvance:()=>{l.adv=!0,window.localStorage.setItem(r.getAdvanceKey(),"1")},omit:(e,t)=>{const n=Object.assign({},e);for(let l=0;l<t.length;l+=1){delete n[t[l]]}return n}},s=r},83169:(e,t,n)=>{function l(e){return["small","middle","large"].includes(e)}function a(e){return!!e&&("number"===typeof e&&!Number.isNaN(e))}n.d(t,{T:()=>a,n:()=>l})},46968:(e,t,n)=>{n.d(t,{Z:()=>m});var l=n(47313),a=n(72884),r=n.n(a),s=n(14903),o=n(83169),i=n(74714),c=n(45531);const d=l.createContext({latestIndex:0}),u=d.Provider,p=e=>{let{className:t,index:n,children:a,split:r,style:s}=e;const{latestIndex:o}=l.useContext(d);return null===a||void 0===a?null:l.createElement(l.Fragment,null,l.createElement("div",{className:t,style:s},a),n<o&&r&&l.createElement("span",{className:"".concat(t,"-split")},r))};var h=n(71047),x=function(e,t){var n={};for(var l in e)Object.prototype.hasOwnProperty.call(e,l)&&t.indexOf(l)<0&&(n[l]=e[l]);if(null!=e&&"function"===typeof Object.getOwnPropertySymbols){var a=0;for(l=Object.getOwnPropertySymbols(e);a<l.length;a++)t.indexOf(l[a])<0&&Object.prototype.propertyIsEnumerable.call(e,l[a])&&(n[l[a]]=e[l[a]])}return n};const j=l.forwardRef(((e,t)=>{var n,a;const{getPrefixCls:c,space:d,direction:j}=l.useContext(i.E_),{size:g=(null===d||void 0===d?void 0:d.size)||"small",align:m,className:f,rootClassName:b,children:v,direction:y="horizontal",prefixCls:k,split:w,style:T,wrap:Z=!1,classNames:S,styles:P}=e,C=x(e,["size","align","className","rootClassName","children","direction","prefixCls","split","style","wrap","classNames","styles"]),[N,L]=Array.isArray(g)?g:[g,g],O=(0,o.n)(L),E=(0,o.n)(N),X=(0,o.T)(L),D=(0,o.T)(N),U=(0,s.Z)(v,{keepEmpty:!0}),_=void 0===m&&"horizontal"===y?"center":m,R=c("space",k),[A,F,I]=(0,h.Z)(R),z=r()(R,null===d||void 0===d?void 0:d.className,F,"".concat(R,"-").concat(y),{["".concat(R,"-rtl")]:"rtl"===j,["".concat(R,"-align-").concat(_)]:_,["".concat(R,"-gap-row-").concat(L)]:O,["".concat(R,"-gap-col-").concat(N)]:E},f,b,I),J=r()("".concat(R,"-item"),null!==(n=null===S||void 0===S?void 0:S.item)&&void 0!==n?n:null===(a=null===d||void 0===d?void 0:d.classNames)||void 0===a?void 0:a.item);let B=0;const M=U.map(((e,t)=>{var n,a;null!==e&&void 0!==e&&(B=t);const r=e&&e.key||"".concat(J,"-").concat(t);return l.createElement(p,{className:J,key:r,index:t,split:w,style:null!==(n=null===P||void 0===P?void 0:P.item)&&void 0!==n?n:null===(a=null===d||void 0===d?void 0:d.styles)||void 0===a?void 0:a.item},e)})),W=l.useMemo((()=>({latestIndex:B})),[B]);if(0===U.length)return null;const G={};return Z&&(G.flexWrap="wrap"),!E&&D&&(G.columnGap=N),!O&&X&&(G.rowGap=L),A(l.createElement("div",Object.assign({ref:t,className:z,style:Object.assign(Object.assign(Object.assign({},G),null===d||void 0===d?void 0:d.style),T)},C),l.createElement(u,{value:W},M)))}));const g=j;g.Compact=c.ZP;const m=g}}]);