!function(e,t){if("object"==typeof exports&&"object"==typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var r=t();for(var o in r)("object"==typeof exports?exports:e)[o]=r[o]}}(this,(()=>(()=>{"use strict";var e={d:(t,r)=>{for(var o in r)e.o(r,o)&&!e.o(t,o)&&Object.defineProperty(t,o,{enumerable:!0,get:r[o]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r:e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},t={};e.r(t),e.d(t,{default:()=>o});let r=window.rrwebPlayer;r||((new class{constructor(){}async init(){await Promise.all([this.insertVideoPlayerScript(),this.insertVideoCss()])}insertVideoPlayerScript(){return new Promise(((e,t)=>{const r=document.createElement("script");r.setAttribute("type","text/javascript"),r.setAttribute("src","https://cdn.jsdelivr.net/npm/rrweb-player@latest/dist/index.js"),document.head.insertBefore(r,document.head.lastChild),r.onload=()=>{e()},r.onerror=()=>{t("rrweb player onload err")}}))}insertVideoCss(){return new Promise(((e,t)=>{const r=document.createElement("link");r.setAttribute("rel","stylesheet"),r.setAttribute("href","https://cdn.jsdelivr.net/npm/rrweb-player@latest/dist/style.css"),document.head.insertBefore(r,document.head.lastChild),r.onload=()=>{e()},r.onerror=()=>{t("rrweb css onload err")}}))}}).init(),r=window.rrwebPlayer);const o=r;return t})()));