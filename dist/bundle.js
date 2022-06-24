/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/error-log/request-error.js":
/*!****************************************!*\
  !*** ./src/error-log/request-error.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"initXMLHttpRequest\": () => (/* binding */ initXMLHttpRequest),\n/* harmony export */   \"listenAndOverwriteFetch\": () => (/* binding */ listenAndOverwriteFetch)\n/* harmony export */ });\n/*\n * @Description: fetch 和 xhr 拦截\n * @Date: 2022-06-23 18:52:34\n * @FilePath: /log-playback/src/error-log/request-error.js\n * @LastEditTime: 2022-06-24 18:37:13\n */\n\nfunction listenAndOverwriteFetch() {\n  var oldFetch = window.fetch;\n  window.fetch = () => {\n    return oldFetch\n      .apply(this, arguments)\n      .then(function (res) {\n        if (!res.ok) {\n          throw new Error(\n            `Fetch err: ${res.url} ${res.status} (${res.statusText})`\n          );\n        }\n        return res;\n      })\n      .catch((error) => {\n        throw error;\n      });\n  };\n}\n\n// 初始化 拦截XMLHttpRequest\nfunction initXMLHttpRequest() {\n  const http = {\n    request: function (param) {\n      console.log(\"request\");\n      //   console.log(param, \"---request\");\n    },\n    response: function (res) {\n      console.log(res, \"---response\");\n      const config = res.config ?? {}\n      if (res?.config?.status !== 200) {\n        throw new Error(`Request Error: ${config.method} ${config.url} status:${config.status}`);\n      }\n    },\n  };\n  let open = XMLHttpRequest.prototype.open;\n  XMLHttpRequest.prototype.open = function (...args) {\n    let send = this.send;\n    let _this = this;\n    let post_data = [];\n    this.send = function (...data) {\n      post_data = data;\n      return send.apply(_this, data);\n    };\n    // 请求前拦截\n    http.request(args);\n    this.addEventListener(\n      \"readystatechange\",\n      function () {\n        if (this.readyState === 4) {\n          let config = {\n            url: args[1],\n            status: this.status,\n            method: args[0],\n            data: post_data,\n          };\n          // 请求后拦截\n          http.response({ config, response: this.response });\n        }\n      },\n      false\n    );\n    return open.apply(this, args);\n  };\n}\n\n\n\n\n//# sourceURL=webpack://log-playback/./src/error-log/request-error.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _error_log_request_error__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./error-log/request-error */ \"./src/error-log/request-error.js\");\n/* harmony import */ var _record_index__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./record/index */ \"./src/record/index.js\");\n\n\n\nif (typeof window !== \"undefined\" && window) {\n  //录屏\n  _record_index__WEBPACK_IMPORTED_MODULE_1__[\"default\"].startRecording();\n  window.onload = () => {\n    (0,_error_log_request_error__WEBPACK_IMPORTED_MODULE_0__.listenAndOverwriteFetch)();\n    (0,_error_log_request_error__WEBPACK_IMPORTED_MODULE_0__.initXMLHttpRequest)();\n  };\n\n  window.addEventListener(\"unhandledrejection\", (error) => {\n    const str = error.message || error.error?.message || error.reason?.message;\n    if (str.includes(\"rrweb\")) {\n      //排除rrweb本身的报错 避免死循环\n      return;\n    }\n    const res = _record_index__WEBPACK_IMPORTED_MODULE_1__[\"default\"].recordError();\n    _record_index__WEBPACK_IMPORTED_MODULE_1__[\"default\"].playVideo(res);\n  });\n\n  window.addEventListener(\"error\", (error) => {\n    const str = error.message || error.error.message || error.reason.message;\n    if (str.includes(\"rrweb\")) {\n      //排除rrweb本身的报错 避免死循环\n      return;\n    }\n    const res = _record_index__WEBPACK_IMPORTED_MODULE_1__[\"default\"].recordError();\n    _record_index__WEBPACK_IMPORTED_MODULE_1__[\"default\"].playVideo(res);\n  });\n}\n\n\n//# sourceURL=webpack://log-playback/./src/index.js?");

/***/ }),

/***/ "./src/record/index.js":
/*!*****************************!*\
  !*** ./src/record/index.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/*\n * @Description:\n * @Date: 2022-06-24 17:07:17\n * @FilePath: /log-playback/src/record/index.js\n * @LastEditTime: 2022-06-24 19:07:18\n */\n\n// import * as rrweb from \"rrweb\";\n\nclass Record {\n  constructor() {\n    this.eventsMatrix = [[]];\n  }\n\n  insertRecordScript() {\n    return new Promise((resolve, reject) => {\n      const Script = document.createElement(\"script\");\n      Script.setAttribute(\"type\", \"text/javascript\");\n      Script.setAttribute(\n        \"src\",\n        \"https://cdn.jsdelivr.net/npm/rrweb@latest/dist/record/rrweb-record.min.js\"\n      );\n      document.head.insertBefore(Script, document.head.lastChild);\n      Script.onload = () => {\n        resolve();\n      };\n      Script.onerror = () => {\n        reject(`rrweb record onload err`);\n      };\n    });\n  }\n\n  insertVideoPlayerScript() {\n    return new Promise((resolve, reject) => {\n      const Script = document.createElement(\"script\");\n      Script.setAttribute(\"type\", \"text/javascript\");\n      Script.setAttribute(\n        \"src\",\n        \"https://cdn.jsdelivr.net/npm/rrweb-player@latest/dist/index.js\"\n      );\n      document.head.insertBefore(Script, document.head.lastChild);\n      Script.onload = () => {\n        resolve();\n      };\n      Script.onerror = () => {\n        reject(`rrweb player onload err`);\n      };\n    });\n  }\n\n  insertVideoCss() {\n    return new Promise((resolve, reject) => {\n      const Link = document.createElement(\"link\");\n      Link.setAttribute(\"rel\", \"stylesheet\");\n      Link.setAttribute(\n        \"href\",\n        \"https://cdn.jsdelivr.net/npm/rrweb-player@latest/dist/style.css\"\n      );\n      document.head.insertBefore(Link, document.head.lastChild);\n      Link.onload = () => {\n        resolve();\n      };\n      Link.onerror = () => {\n        reject(`rrweb css onload err`);\n      };\n    });\n  }\n\n  async startRecording() {\n    await this.insertRecordScript();\n    if (!rrwebRecord) {\n      return;\n    }\n    rrwebRecord({\n      emit: (event, isCheckout) => {\n        // isCheckout 是一个标识，告诉你重新制作了快照\n        if (isCheckout) {\n          this.eventsMatrix.push([]);\n        }\n        if (this.eventsMatrix.length > 20) {\n          //限制最多20个快照\n          this.eventsMatrix.shift();\n        }\n        const lastEvents = this.eventsMatrix[this.eventsMatrix.length - 1];\n        lastEvents.push(event);\n      },\n      // checkoutEveryNth: 200, // 每 200 个 event 重新制作快照\n      checkoutEveryNms: 20000, // 每20秒重新制作制作一个快照\n    });\n  }\n\n  recordError() {\n    const len = this.eventsMatrix.length;\n    let events = this.eventsMatrix;\n    if (len >= 2) {\n      events = this.eventsMatrix[len - 2].concat(this.eventsMatrix[len - 1]);\n    } else {\n      events = this.eventsMatrix[0];\n    }\n    return events;\n  }\n\n  async playVideo(events) {\n    await Promise.all([this.insertVideoPlayerScript(), this.insertVideoCss()]);\n    const replayer = new rrwebPlayer({\n      target: document.body, // 可以自定义 DOM 元素\n      // 配置项\n      props: {\n        events,\n      },\n    });\n    replayer.play();\n  }\n}\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (new Record());\n\n\n//# sourceURL=webpack://log-playback/./src/record/index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});