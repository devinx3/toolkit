(self.webpackChunktoolkit=self.webpackChunktoolkit||[]).push([[600],{76671:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>A});var o=n(47313),r=n(7432),a=n(12463),i=n(67407),c=n(87785),l=n(68197),d=n(61763),s=n(18708),h=n(23232),p=n(66672),g=n(59624),u=n(22231),m=n(6986),x=n(571),f=n(43036),b=n(17534),v=n(23988),y=n(52984),j=n.n(y),w=n(46417);const{Title:Z,Text:S}=r.default;function C(e){return e||(e="secret"),e.length<32&&(e=j().MD5(e).toString()),e}function k(e,t){return e?(t||a.Z.info({description:"\u672a\u8f93\u5165\u79d8\u94a5, \u5df2\u81ea\u52a8\u8bbe\u7f6e\u79d8\u94a5",placement:"top"}),!0):(a.Z.error({description:"\u8bf7\u8f93\u5165\u5f85\u5904\u7406\u6570\u636e",placement:"top"}),!1)}const T=(e,t,n)=>{k(e,t)&&n(function(e,t){return j().AES.encrypt(e,C(t)).toString()}(e,t))},z=(e,t,n)=>{if(k(e,t))try{const o=function(e,t){return j().AES.decrypt(e,C(t)).toString(j().enc.Utf8)}(e,t);""===o&&a.Z.error({description:"\u89e3\u5bc6\u5931\u8d25, \u8bf7\u68c0\u67e5\u79d8\u94a5\u662f\u5426\u6b63\u786e",placement:"top"}),n(o)}catch(o){a.Z.error({description:"\u89e3\u5bc6\u5931\u8d25, \u8bf7\u68c0\u67e5\u79d8\u94a5\u662f\u5426\u6b63\u786e, \u5f02\u5e38: "+o.message,placement:"top"}),n("")}},A=()=>{const[e,t]=o.useState(""),[n,r]=o.useState(""),[a,y]=o.useState("");return(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(Z,{level:3,children:"\u52a0\u5bc6/\u89e3\u5bc6\u6587\u672c"}),(0,w.jsx)(c.Z,{}),(0,w.jsxs)(l.Z,{style:{marginTop:"10px"},children:[(0,w.jsx)(S,{children:"\u5f85\u5904\u7406\u6570\u636e(\u4ec5\u652f\u6301UTF8)"}),(0,w.jsx)(d.Z,{title:"\u5bfc\u5165",children:(0,w.jsx)(s.default,{maxCount:1,beforeUpload:e=>((e,t,n)=>(f.Z.readAsText(e,(o=>{t(o),b.Z.enableAdvance()&&n(e.name)})),!1))(e,t,y),showUploadList:!1,children:(0,w.jsx)(h.ZP,{icon:(0,w.jsx)(u.Z,{}),type:"text",size:"small"})})}),(0,w.jsx)(p.Z.TextArea,{style:{marginTop:"5px"},rows:8,value:e,onChange:e=>t(e.target.value)})]}),(0,w.jsxs)(l.Z,{style:{marginTop:"10px"},children:[(0,w.jsx)(g.Z,{span:2,children:(0,w.jsx)(h.ZP,{type:"primary",onClick:t=>T(e,a,r),children:"AES\u52a0\u5bc6"})}),(0,w.jsx)(g.Z,{span:2,children:(0,w.jsx)(h.ZP,{type:"primary",onClick:t=>z(e,a,r),children:"AES\u89e3\u5bc6"})}),(0,w.jsx)(g.Z,{span:8,children:(0,w.jsx)(p.Z,{addonBefore:(0,w.jsx)(d.Z,{title:"\u79d8\u94a5\u957f\u5ea6\u5c0f\u4e8e32, \u4f1a\u5bf9\u79d8\u94a5\u52a0\u5bc6",children:"\u79d8\u94a5"}),placeholder:"secret",value:a,onChange:e=>y(e.target.value)})})]}),(0,w.jsxs)(l.Z,{style:{marginTop:"10px"},children:[(0,w.jsx)(S,{children:"\u5904\u7406\u540e\u6570\u636e"}),(0,w.jsx)(d.Z,{title:"\u4e0b\u8f7d",children:(0,w.jsx)(h.ZP,{type:"text",disabled:!n,icon:(0,w.jsx)(m.Z,{}),onClick:()=>((e,t)=>{let n=null;b.Z.enableAdvance()&&(n=t),f.Z.download(e,n)})(n,a),size:"small"})}),(0,w.jsx)(x.Z,{type:"text",disabled:!n,onClick:()=>(e=>{const t=v.Z.copyToClipboard(e);if(t)return i.ZP.success("\u590d\u5236\u6210\u529f"),!0;i.ZP.warn("\u590d\u5236\u5931\u8d25, "+t)})(n),size:"small"}),(0,w.jsx)(p.Z.TextArea,{style:{marginTop:"5px"},rows:8,value:n})]})]})}},571:(e,t,n)=>{"use strict";n.d(t,{Z:()=>s});var o=n(47313),r=n(61763),a=n(23232),i=n(43681),c=n(66407),l=n(17534),d=n(46417);const s=e=>{const[t,n]=o.useState(!1),s=l.Z.omit(e,["tipTitle"]);return(0,d.jsx)(r.Z,{title:e.tipTitle||"\u590d\u5236",children:(0,d.jsx)(a.ZP,{...s,onClick:o=>{if(!t&&e.onClick){const t=e.onClick(o);return!0===t&&n(!0),t}},icon:t?(0,d.jsx)(i.Z,{style:{color:"#52c41a"}}):(0,d.jsx)(c.Z,{}),onMouseLeave:()=>{t&&n(!1)}})})}},43036:(e,t,n)=>{"use strict";n.d(t,{Z:()=>o});const o={readAsText:e=>{let{file:t,handleRead:n,charset:o,handleError:r}=e;o||(o="utf8");const a=new FileReader;a.onload=()=>{n(a.result)},a.onerror=r,a.readAsText(t,o)},download:(e,t)=>{t||(t="download");let n=URL.createObjectURL(new Blob([e]));const o=document.createElement("a");o.href=n,o.setAttribute("download",t),document.body.appendChild(o),o.click(),document.body.removeChild(o)}}},17534:(e,t,n)=>{"use strict";n.d(t,{X:()=>r,Z:()=>i});const o={},r={loadMonaco:"converter.loadEditor.loadMonaco.loaded"},a={getFromCache:e=>o[e],setToCache:(e,t)=>o[e]=t,getAdvanceKey:()=>"active=adv",enableAdvance:()=>(null!==o.adv&&void 0!==o.adv||(o.adv="1"===window.localStorage.getItem(a.getAdvanceKey())),!0===o.adv),setAdvance:()=>{o.adv=!0,window.localStorage.setItem(a.getAdvanceKey(),"1")},omit:(e,t)=>{const n=Object.assign({},e);for(let o=0;o<t.length;o+=1){delete n[t[o]]}return n}},i=a},23988:(e,t,n)=>{"use strict";n.d(t,{Z:()=>o});const o={underlineToHump:e=>e.replace(/_(\w)/g,(function(e,t){return t.toUpperCase()})),humpToUnderline:e=>e.replace(/([A-Z])/g,"_$1").toLowerCase(),isStr:e=>"string"===typeof e,isBlank:e=>void 0===e||null===e||""===e,copyToClipboard:e=>{const t=document.createElement("textarea");t.value=e,document.body.appendChild(t),t.select();const n=document.execCommand("copy");return t.remove(),n}}},87785:(e,t,n)=>{"use strict";n.d(t,{Z:()=>u});var o=n(47313),r=n(72884),a=n.n(r),i=n(74714),c=n(87177),l=n(40601),d=n(83447),s=n(73239);const h=e=>{const{componentCls:t,sizePaddingEdgeHorizontal:n,colorSplit:o,lineWidth:r,textPaddingInline:a,orientationMargin:i,verticalMarginInline:d}=e;return{[t]:Object.assign(Object.assign({},(0,l.Wf)(e)),{borderBlockStart:"".concat((0,c.bf)(r)," solid ").concat(o),"&-vertical":{position:"relative",top:"-0.06em",display:"inline-block",height:"0.9em",marginInline:d,marginBlock:0,verticalAlign:"middle",borderTop:0,borderInlineStart:"".concat((0,c.bf)(r)," solid ").concat(o)},"&-horizontal":{display:"flex",clear:"both",width:"100%",minWidth:"100%",margin:"".concat((0,c.bf)(e.dividerHorizontalGutterMargin)," 0")},["&-horizontal".concat(t,"-with-text")]:{display:"flex",alignItems:"center",margin:"".concat((0,c.bf)(e.dividerHorizontalWithTextGutterMargin)," 0"),color:e.colorTextHeading,fontWeight:500,fontSize:e.fontSizeLG,whiteSpace:"nowrap",textAlign:"center",borderBlockStart:"0 ".concat(o),"&::before, &::after":{position:"relative",width:"50%",borderBlockStart:"".concat((0,c.bf)(r)," solid transparent"),borderBlockStartColor:"inherit",borderBlockEnd:0,transform:"translateY(50%)",content:"''"}},["&-horizontal".concat(t,"-with-text-left")]:{"&::before":{width:"calc(".concat(i," * 100%)")},"&::after":{width:"calc(100% - ".concat(i," * 100%)")}},["&-horizontal".concat(t,"-with-text-right")]:{"&::before":{width:"calc(100% - ".concat(i," * 100%)")},"&::after":{width:"calc(".concat(i," * 100%)")}},["".concat(t,"-inner-text")]:{display:"inline-block",paddingBlock:0,paddingInline:a},"&-dashed":{background:"none",borderColor:o,borderStyle:"dashed",borderWidth:"".concat((0,c.bf)(r)," 0 0")},["&-horizontal".concat(t,"-with-text").concat(t,"-dashed")]:{"&::before, &::after":{borderStyle:"dashed none none"}},["&-vertical".concat(t,"-dashed")]:{borderInlineStartWidth:r,borderInlineEnd:0,borderBlockStart:0,borderBlockEnd:0},["&-plain".concat(t,"-with-text")]:{color:e.colorText,fontWeight:"normal",fontSize:e.fontSize},["&-horizontal".concat(t,"-with-text-left").concat(t,"-no-default-orientation-margin-left")]:{"&::before":{width:0},"&::after":{width:"100%"},["".concat(t,"-inner-text")]:{paddingInlineStart:n}},["&-horizontal".concat(t,"-with-text-right").concat(t,"-no-default-orientation-margin-right")]:{"&::before":{width:"100%"},"&::after":{width:0},["".concat(t,"-inner-text")]:{paddingInlineEnd:n}}})}},p=(0,d.I$)("Divider",(e=>{const t=(0,s.TS)(e,{dividerHorizontalWithTextGutterMargin:e.margin,dividerHorizontalGutterMargin:e.marginLG,sizePaddingEdgeHorizontal:0});return[h(t)]}),(e=>({textPaddingInline:"1em",orientationMargin:.05,verticalMarginInline:e.marginXS})),{unitless:{orientationMargin:!0}});var g=function(e,t){var n={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(n[o]=e[o]);if(null!=e&&"function"===typeof Object.getOwnPropertySymbols){var r=0;for(o=Object.getOwnPropertySymbols(e);r<o.length;r++)t.indexOf(o[r])<0&&Object.prototype.propertyIsEnumerable.call(e,o[r])&&(n[o[r]]=e[o[r]])}return n};const u=e=>{const{getPrefixCls:t,direction:n,divider:r}=o.useContext(i.E_),{prefixCls:c,type:l="horizontal",orientation:d="center",orientationMargin:s,className:h,rootClassName:u,children:m,dashed:x,plain:f,style:b}=e,v=g(e,["prefixCls","type","orientation","orientationMargin","className","rootClassName","children","dashed","plain","style"]),y=t("divider",c),[j,w,Z]=p(y),S=d.length>0?"-".concat(d):d,C=!!m,k="left"===d&&null!=s,T="right"===d&&null!=s,z=a()(y,null===r||void 0===r?void 0:r.className,w,Z,"".concat(y,"-").concat(l),{["".concat(y,"-with-text")]:C,["".concat(y,"-with-text").concat(S)]:C,["".concat(y,"-dashed")]:!!x,["".concat(y,"-plain")]:!!f,["".concat(y,"-rtl")]:"rtl"===n,["".concat(y,"-no-default-orientation-margin-left")]:k,["".concat(y,"-no-default-orientation-margin-right")]:T},h,u),A=o.useMemo((()=>"number"===typeof s?s:/^\d+$/.test(s)?Number(s):s),[s]),E=Object.assign(Object.assign({},k&&{marginLeft:A}),T&&{marginRight:A});return j(o.createElement("div",Object.assign({className:z,style:Object.assign(Object.assign({},null===r||void 0===r?void 0:r.style),b)},v,{role:"separator"}),m&&"vertical"!==l&&o.createElement("span",{className:"".concat(y,"-inner-text"),style:E},m)))}},42480:()=>{}}]);