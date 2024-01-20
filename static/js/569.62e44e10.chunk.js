"use strict";(self.webpackChunktoolkit=self.webpackChunktoolkit||[]).push([[569],{16684:(t,e,n)=>{function o(t,e){if(!Object.prototype.hasOwnProperty.call(t,e))throw new TypeError("attempted to use private field on non-instance");return t}n.d(e,{ep:()=>O,zn:()=>c,j5:()=>d});var r=0;function i(t){return"__private_"+r+++"_"+t}var a=n(47313),s=i("next");class c{constructor(t){let{code:e,name:n,script:o,version:r}=t;Object.defineProperty(this,s,{writable:!0,value:null}),this.code=e,this.name=n,this.script=o,this.version=r||0}hasNext(){return!!o(this,s)[s]}add(t,e,n,r){if(!n)throw Error("\u6dfb\u52a0\u5f02\u5e38, \u65e0\u53ef\u6267\u884c\u811a\u672c");return o(this,s)[s]=new c({code:t,name:e,script:n,version:r}),o(this,s)[s]}next(){return o(this,s)[s]}}var l=i("origin");class d{constructor(t){Object.defineProperty(this,l,{writable:!0,value:void 0}),o(this,l)[l]=t}get(){return o(this,l)[l]}}class u extends Error{}var p=i("category"),h=i("share"),g=i("previous"),v=i("stage"),m=i("plugins");class f{constructor(t,e,n,r){Object.defineProperty(this,p,{writable:!0,value:"-"}),Object.defineProperty(this,h,{writable:!0,value:void 0}),Object.defineProperty(this,g,{writable:!0,value:null}),Object.defineProperty(this,v,{writable:!0,value:null}),Object.defineProperty(this,m,{writable:!0,value:{}}),o(this,p)[p]=t,this.getCode=()=>e.code,this.getName=()=>e.name,o(this,v)[v]=n,o(this,g)[g]=r,this.originInputData=null}getOriginInputData(){return this.originInputData}getStageCode(){var t;return null===(t=o(this,v)[v])||void 0===t?void 0:t.code}getStageName(){var t;return null===(t=o(this,v)[v])||void 0===t?void 0:t.name}firstStage(){var t;return!((null===(t=o(this,v)[v])||void 0===t?void 0:t.position)>0)}hasNext(){return!!o(this,v)[v].nextFlag}useShare(t){return void 0!==o(this,h)[h]&&null!==o(this,h)[h]||(o(this,h)[h]=t instanceof Function?t():t),[o(this,h)[h],t=>o(this,h)[h]=t]}getPreviousStageOutput(){return o(this,g)[g].output}addPlugin(t,e){return o(this,m)[m][t]=e}getPlugin(t){return o(this,m)[m][t]}}const b=(t,e)=>{const n={output:void 0},o={code:e.code,name:e.name,nextFlag:e.hasNext(),position:-1},r=new f(t,e,o,n);return{get:()=>r,setInputData:t=>r.originInputData=t,nextStage:(t,e,r)=>{t&&(((t,e)=>{o.code=t.code,o.name=t.name,o.nextFlag=t.hasNext(),o.position=e})(t,e),n.output=r)}}};class x{constructor(t,e){this.invocation=null,this.source=t,this.paramNames=e||[]}compile(){const t=Function;this.invocation=new t(...this.paramNames,this.source)}execute(t,e){if(!this.invocation)throw new u("\u672a\u7f16\u8bd1\u7684\u65b9\u6cd5, \u65e0\u6cd5\u6267\u884c");return this.invocation.call(t,...e)}}const y=(()=>{const t={},e=(t,e,n)=>{let o=t[e];return void 0===o&&void 0!==n&&(o=t[e]=n),o};return{get:(n,o,r)=>{const i=e(t,n,{});return e(i,o,r)},set:(n,o,r)=>e(t,n,{})[o]=r,remove:(n,o)=>{const r=e(t,n,void 0);if(void 0!==r&&void 0!==r[o])try{delete r[o]}catch(i){r[o]=void 0}}}})();class w{constructor(t,e,n,o,r){this.category=t,this.code=e,this.sourceCode=n,this.version=o||0,this.transform=r}_compileInvocation(){if(this.transform)try{const t="function f(inputData, inputObj, Util, React) {",e="}",n=this.transform(t+this.sourceCode+e);this.sourceCode=n.substring(t.length,n.length-e.length)}catch(e){throw new u("\u7f16\u8bd1\u5931\u8d25: "+e.message)}const t=new x(this.sourceCode,["inputData","inputObj","Util","React"]);return t.compile(),t}_compileAndGetInvocation(){let t=y.get(this.category,this.code);return t&&t.v===this.version||(y[this.code]=t={},t.v=this.version),t.i?t.i:t.i=this._compileInvocation()}run(t,e,n,o){const r=n?n(e):void 0;return this._compileAndGetInvocation().execute(t,[e,r,o,this.transform?a:void 0])}}class O{constructor(t,e,n){let o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};this.options=o,this.handler=n,this.root=e,this.category=t,this.context=b(t,this.root)}nexState(t,e,n){this.context.nextStage(t,e,n)}submit(t){return(async()=>{try{this.context.setInputData(t);const{before:e,after:n,convertMedian:o,transform:r,getUtil:i}=this.handler,a=i&&i()||{},{handleInputObj:s}=e(this.root,t)||{};let c,l=this.root.script?this.root:this.root.next(),u=t,p=0;for(;l;){this.nexState(l,p,c);c=new w(this.category,l.code,l.script,l.version,r).run(this.context.get(),u,s,a),c instanceof Function&&(c=c.apply(this.context.get())),c instanceof Promise&&(c=await c),u=o(l,c),l=l.next(),p++}return this.options.enableJsx&&(c=new d(c)),n(this.root,c)}catch(a){var e,n,o,r,i;console.debug("".concat((null===(e=this.context)||void 0===e||null===(n=e.stage)||void 0===n?void 0:n.name)||(null===(o=this.root)||void 0===o?void 0:o.name)," \u6267\u884c\u5f02\u5e38"),a);const t=this.root.hasNext()?null===(r=this.context)||void 0===r||null===(i=r.stage)||void 0===i?void 0:i.name:null;let s=(a instanceof Object?a.message:a)||"";throw null===t||void 0===t?s:"".concat(t,": ").concat(s)}})()}}},87518:(t,e,n)=>{n.d(e,{Je:()=>r,bn:()=>o});const o={JSON:"json",TXT:"txt",JSX:"jsx"},r={PLATFORM:"P|",EXPAND_ADD:"EA|"}},80122:(t,e,n)=>{n.d(e,{Z:()=>u});var o=n(47313),r=n(87518),i=n(16684),a=n(46417);const s=o.lazy((()=>Promise.all([n.e(272),n.e(374),n.e(10),n.e(36),n.e(750),n.e(984),n.e(718),n.e(868),n.e(400)]).then(n.bind(n,59659)))),c=o.lazy((()=>Promise.all([n.e(374),n.e(984),n.e(662),n.e(435)]).then(n.bind(n,6945))));class l{constructor(){this.convertHandler=null}setConvertHandler(t){this.convertHandler=t}createScriptEvent(t,e,n,o){return new i.zn({code:t,name:e,script:n,version:o})}onConvert(t){if(this.convertHandler)return this.convertHandler(t);console.warn("No convert handler")}}const d={};d[r.bn.JSON]=t=>t instanceof Object?t:JSON.parse(t);const u=t=>{let{lang:e="txt",category:n,manage:r,handleInputObj:i,dataBlockRender:u}=t;const p=o.useMemo((()=>new l),[]),h={...r,lang:e,category:n||e,context:p},g={lang:e,category:n||e,context:p,dataBlockRender:u,handleInputObj:i||d[e]};return(0,a.jsxs)(o.Suspense,{fallback:(0,a.jsx)(a.Fragment,{}),children:[(0,a.jsx)(s,{...h}),(0,a.jsx)(c,{...g})]})}},23988:(t,e,n)=>{n.d(e,{Z:()=>o});const o={underlineToHump:t=>t.replace(/_(\w)/g,(function(t,e){return e.toUpperCase()})),humpToUnderline:t=>t.replace(/([A-Z])/g,"_$1").toLowerCase(),isStr:t=>"string"===typeof t,isBlank:t=>void 0===t||null===t||""===t,copyToClipboard:t=>{const e=document.createElement("textarea");e.value=t,document.body.appendChild(e),e.select();const n=document.execCommand("copy");return e.remove(),n}}},23961:(t,e,n)=>{n.d(e,{Z:()=>o});const o=t=>t?"function"===typeof t?t():t:null},2717:(t,e,n)=>{n.d(e,{ZP:()=>p,t5:()=>u});var o=n(47313),r=n(72884),i=n.n(r),a=n(51820),s=n(23961),c=n(74714),l=n(62506),d=function(t,e){var n={};for(var o in t)Object.prototype.hasOwnProperty.call(t,o)&&e.indexOf(o)<0&&(n[o]=t[o]);if(null!=t&&"function"===typeof Object.getOwnPropertySymbols){var r=0;for(o=Object.getOwnPropertySymbols(t);r<o.length;r++)e.indexOf(o[r])<0&&Object.prototype.propertyIsEnumerable.call(t,o[r])&&(n[o[r]]=t[o[r]])}return n};const u=t=>{const{hashId:e,prefixCls:n,className:r,style:c,placement:l="top",title:d,content:u,children:p}=t;return o.createElement("div",{className:i()(e,n,"".concat(n,"-pure"),"".concat(n,"-placement-").concat(l),r),style:c},o.createElement("div",{className:"".concat(n,"-arrow")}),o.createElement(a.G,Object.assign({},t,{className:e,prefixCls:n}),p||((t,e,n)=>e||n?o.createElement(o.Fragment,null,e&&o.createElement("div",{className:"".concat(t,"-title")},(0,s.Z)(e)),o.createElement("div",{className:"".concat(t,"-inner-content")},(0,s.Z)(n))):null)(n,d,u)))},p=t=>{const{prefixCls:e,className:n}=t,r=d(t,["prefixCls","className"]),{getPrefixCls:a}=o.useContext(c.E_),s=a("popover",e),[p,h,g]=(0,l.Z)(s);return p(o.createElement(u,Object.assign({},r,{prefixCls:s,hashId:h,className:i()(n,g)})))}},61677:(t,e,n)=>{n.d(e,{Z:()=>v});var o=n(47313),r=n(72884),i=n.n(r),a=n(23961),s=n(53553),c=n(74714),l=n(61763),d=n(2717),u=n(62506),p=function(t,e){var n={};for(var o in t)Object.prototype.hasOwnProperty.call(t,o)&&e.indexOf(o)<0&&(n[o]=t[o]);if(null!=t&&"function"===typeof Object.getOwnPropertySymbols){var r=0;for(o=Object.getOwnPropertySymbols(t);r<o.length;r++)e.indexOf(o[r])<0&&Object.prototype.propertyIsEnumerable.call(t,o[r])&&(n[o[r]]=t[o[r]])}return n};const h=t=>{let{title:e,content:n,prefixCls:r}=t;return o.createElement(o.Fragment,null,e&&o.createElement("div",{className:"".concat(r,"-title")},(0,a.Z)(e)),o.createElement("div",{className:"".concat(r,"-inner-content")},(0,a.Z)(n)))},g=o.forwardRef(((t,e)=>{const{prefixCls:n,title:r,content:a,overlayClassName:d,placement:g="top",trigger:v="hover",mouseEnterDelay:m=.1,mouseLeaveDelay:f=.1,overlayStyle:b={}}=t,x=p(t,["prefixCls","title","content","overlayClassName","placement","trigger","mouseEnterDelay","mouseLeaveDelay","overlayStyle"]),{getPrefixCls:y}=o.useContext(c.E_),w=y("popover",n),[O,C,P]=(0,u.Z)(w),j=y(),S=i()(d,C,P);return O(o.createElement(l.Z,Object.assign({placement:g,trigger:v,mouseEnterDelay:m,mouseLeaveDelay:f,overlayStyle:b},x,{prefixCls:w,overlayClassName:S,ref:e,overlay:r||a?o.createElement(h,{prefixCls:w,title:r,content:a}):null,transitionName:(0,s.m)(j,"zoom-big",x.transitionName),"data-popover-inject":!0})))}));g._InternalPanelDoNotUseOrYouWillBeFired=d.ZP;const v=g},62506:(t,e,n)=>{n.d(e,{Z:()=>p});var o=n(40601),r=n(96766),i=n(15575),a=n(75097),s=n(83447),c=n(73239),l=n(37488);const d=t=>{const{componentCls:e,popoverColor:n,titleMinWidth:r,fontWeightStrong:a,innerPadding:s,boxShadowSecondary:c,colorTextHeading:l,borderRadiusLG:d,zIndexPopup:u,titleMarginBottom:p,colorBgElevated:h,popoverBg:g,titleBorderBottom:v,innerContentPadding:m,titlePadding:f}=t;return[{[e]:Object.assign(Object.assign({},(0,o.Wf)(t)),{position:"absolute",top:0,left:{_skip_check_:!0,value:0},zIndex:u,fontWeight:"normal",whiteSpace:"normal",textAlign:"start",cursor:"auto",userSelect:"text",transformOrigin:"var(--arrow-x, 50%) var(--arrow-y, 50%)","--antd-arrow-background-color":h,"&-rtl":{direction:"rtl"},"&-hidden":{display:"none"},["".concat(e,"-content")]:{position:"relative"},["".concat(e,"-inner")]:{backgroundColor:g,backgroundClip:"padding-box",borderRadius:d,boxShadow:c,padding:s},["".concat(e,"-title")]:{minWidth:r,marginBottom:p,color:l,fontWeight:a,borderBottom:v,padding:f},["".concat(e,"-inner-content")]:{color:n,padding:m}})},(0,i.ZP)(t,"var(--antd-arrow-background-color)"),{["".concat(e,"-pure")]:{position:"relative",maxWidth:"none",margin:t.sizePopupArrow,display:"inline-block",["".concat(e,"-content")]:{display:"inline-block"}}}]},u=t=>{const{componentCls:e}=t;return{[e]:a.i.map((n=>{const o=t["".concat(n,"6")];return{["&".concat(e,"-").concat(n)]:{"--antd-arrow-background-color":o,["".concat(e,"-inner")]:{backgroundColor:o},["".concat(e,"-arrow")]:{background:"transparent"}}}}))}},p=(0,s.I$)("Popover",(t=>{const{colorBgElevated:e,colorText:n}=t,o=(0,c.TS)(t,{popoverBg:e,popoverColor:n});return[d(o),u(o),(0,r._y)(o,"zoom-big")]}),(t=>{const{lineWidth:e,controlHeight:n,fontHeight:o,padding:r,wireframe:a,zIndexPopupBase:s,borderRadiusLG:c,marginXS:d,lineType:u,colorSplit:p,paddingSM:h}=t,g=n-o,v=g/2,m=g/2-e,f=r;return Object.assign(Object.assign(Object.assign({titleMinWidth:177,zIndexPopup:s+30},(0,l.w)(t)),(0,i.wZ)({contentRadius:c,limitVerticalRadius:!0})),{innerPadding:a?0:12,titleMarginBottom:a?0:d,titlePadding:a?"".concat(v,"px ").concat(f,"px ").concat(m,"px"):0,titleBorderBottom:a?"".concat(e,"px ").concat(u," ").concat(p):"none",innerContentPadding:a?"".concat(h,"px ").concat(f,"px"):0})}),{resetStyle:!1,deprecatedTokens:[["width","titleMinWidth"],["minWidth","titleMinWidth"]]})}}]);