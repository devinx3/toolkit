(self.webpackChunktoolkit=self.webpackChunktoolkit||[]).push([[435],{25380:e=>{function t(e){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=25380,e.exports=t},6945:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>D});var r=n(47313),a=n(82027),o=n(87518),s=n(67407),c=n(16031),i=n.n(c),u=n(10658),l=n.n(u),d=n(52984),h=n.n(d),p=n(48737),f=n(16684),g=n(73350);const k={_:i(),dayjs:l(),cryptoJS:h(),XLSX:p,message:s.ZP,importPlugin:e=>new Promise(e)};function m(e){return e instanceof f.j5?e:e instanceof Object?JSON.stringify(e,null,2):(n="",null===(t=e)||void 0===t?n:t);var t,n}k.importPlugin=e=>{if("antd"===e)return Promise.all([n.e(272),n.e(19),n.e(36),n.e(750),n.e(47),n.e(970),n.e(514),n.e(463),n.e(178)]).then(n.bind(n,72178));if("@ant-design/icons"===e)return Promise.resolve().then(n.bind(n,5410));if("@ant-design/pro-components"===e)return Promise.all([n.e(272),n.e(19),n.e(36),n.e(750),n.e(47),n.e(970),n.e(514),n.e(898)]).then(n.bind(n,48898));if("@monaco-editor/react"===e)return n.e(718).then(n.bind(n,24718));throw new Error("\u4e0d\u5b58\u5728\u7684\u63d2\u4ef6\uff1a"+e)};var v=n(46417);class b{constructor(){this.checkInputData=null}setCheckInputData(e){this.checkInputData=e}onCheckInputData(e){return!this.checkInputData||this.checkInputData(e)}}const D=e=>{let{lang:t,category:n,context:s,manageBlock:c,dataBlockRender:i,handleInputObj:u}=e;const[l,d]=r.useState(""),[h,p]=r.useState(""),[D,I]=r.useState(""),[C,w]=r.useState(!1),P=r.useMemo((()=>new b),[]);return s.setConvertHandler((e=>{C?console.warn("Conversion failed because loading"):(w(!0),setTimeout((()=>{const r=P.onCheckInputData(l);if(!0!==r)return p("")&I(r)&w(!1);const a={enableJsx:t===o.bn.JSX},s=e=>p("")&I(e),c=e=>""===e?s("\u65e0\u6267\u884c\u7ed3\u679c"):p(e)&I("");try{(function(e,t,n,r){let a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:{};const o={getUtil:()=>({...k}),before:(e,n)=>({handleInputObj:t}),after:(e,t)=>m(t),convertMedian:(e,n)=>{var r;return t&&null!==e&&void 0!==e&&null!==(r=e.hasNext)&&void 0!==r&&r.call(e)?m(n):n},transform:a.enableJsx?e=>{var t;return null===(t=(0,g.transform)(e,{presets:["react"]}))||void 0===t?void 0:t.code}:void 0};return new f.ep(e,n,o,a).submit(r)})(n,u,e,l,a).then(c).catch(s).finally((()=>w(!1)))}catch(i){w(!1),s(i.message)}}),60))})),(0,v.jsx)(a.Z,{spinning:C,children:i({state:{inputData:l,setInputData:d,outputData:h,setOutputData:p,errorMsg:D,setErrorMsg:I},manageBlock:c,context:{category:n},getCurrentNode:()=>{const e=s.getNode()?{...s.getNode()}:{};return e.code=(e.script?"TMP|1|":"TMP|0|")+e.code,e},setCheckInputData:e=>P.setCheckInputData(e)})})}},42480:()=>{}}]);