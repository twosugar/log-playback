!function(e,t){if("object"==typeof exports&&"object"==typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var r=t();for(var o in r)("object"==typeof exports?exports:e)[o]=r[o]}}(this,(()=>(()=>{"use strict";var e={};(e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})})(e);const t=new class{constructor(){this.eventsMatrix=[[]]}insertRecordScript(){return new Promise(((e,t)=>{const r=document.createElement("script");r.setAttribute("type","text/javascript"),r.setAttribute("src","https://cdn.jsdelivr.net/npm/rrweb@latest/dist/record/rrweb-record.min.js"),document.head.insertBefore(r,document.head.lastChild),r.onload=()=>{e()},r.onerror=()=>{t("rrweb record onload err")}}))}async startRecording(){await this.insertRecordScript(),window.rrwebRecord&&rrwebRecord({emit:(e,t)=>{t&&this.eventsMatrix.push([]),this.eventsMatrix.length>20&&this.eventsMatrix.shift(),this.eventsMatrix[this.eventsMatrix.length-1].push(e)},checkoutEveryNms:2e4})}recordError(){const e=this.eventsMatrix.length;let t=this.eventsMatrix;return t=e>=2?this.eventsMatrix[e-2].concat(this.eventsMatrix[e-1]):this.eventsMatrix[0],t}},r=({referer:e,timestamp:t,date:r,rrwebData:o,userAgent:s,errorMessage:n})=>{const i=window.logConfig?.reportUrl;i&&fetch(i,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({referer:e,timestamp:t,date:r,errorMessage:n,userAgent:s,rrwebData:o}),mode:"cors"}).catch((e=>{console.log(e)}))};return"undefined"!=typeof window&&window&&(t.startRecording(),window.onload=()=>{var e;e=window.fetch,window.fetch=(t,r)=>e(t,r).then((function(e){if(!e.ok)throw new Error(`Fetch err: ${e.url} ${e.status} (${e.statusText})`);return e})).catch((e=>{throw e})),function(){let e=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(...t){let r=this.send,o=this,s=[];return this.send=function(...e){return s=e,r.apply(o,e)},this.addEventListener("readystatechange",(function(){if(4===this.readyState){!function(e){const t=e.config??{};if(200!==e?.config?.status)throw new Error(`Request Error: ${t.method} ${t.url} status:${t.status}`)}({config:{url:t[1],status:this.status,method:t[0],data:s},response:this.response})}}),!1),e.apply(this,t)}}()},window.addEventListener("unhandledrejection",(e=>{const o=t.recordError(),s=e.message||e.error?.message||e.reason?.message||e.reason,n=Date.now(),i=new Date(n).toLocaleString();r({referer:window.location.href,timestamp:n,date:i,errorMessage:s,userAgent:window.navigator?.userAgent,rrwebData:JSON.stringify({res:o})})})),window.addEventListener("error",(e=>{const o=t.recordError(),s=e.message||e.error?.message||e.reason?.message||e.target?.outerHTML,n=Date.now(),i=new Date(n).toLocaleString();r({referer:window.location.href,timestamp:n,date:i,errorMessage:s,userAgent:window.navigator?.userAgent,rrwebData:JSON.stringify({res:o})})}),!0)),e})()));