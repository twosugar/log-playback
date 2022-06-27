/*
 * @Description: fetch 和 xhr 拦截
 * @Date: 2022-06-23 18:52:34
 * @FilePath: /log-playback/src/error-log/request-error.js
 * @LastEditTime: 2022-06-27 19:48:48
 */

function listenAndOverwriteFetch() {
  var oldFetch = window.fetch;
  
  window.fetch = (url, options) => {
    return oldFetch(url, options)
      .then(function (res) {
        if (!res.ok) {
          throw new Error(
            `Fetch err: ${res.url} ${res.status} (${res.statusText})`
          );
        }
        return res;
      })
      .catch((error) => {
        throw error;
      });
  };
}

// 初始化 拦截XMLHttpRequest
function initXMLHttpRequest() {
  const http = {
    request: function (param) {
      // console.log("request");
      //   console.log(param, "---request");
    },
    response: function (res) {
      // console.log(res, "---response");
      const config = res.config ?? {}
      if (res?.config?.status !== 200) {
        throw new Error(`Request Error: ${config.method} ${config.url} status:${config.status}`);
      }
    },
  };
  let open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (...args) {
    let send = this.send;
    let _this = this;
    let post_data = [];
    this.send = function (...data) {
      post_data = data;
      return send.apply(_this, data);
    };
    // 请求前拦截
    http.request(args);
    this.addEventListener(
      "readystatechange",
      function () {
        if (this.readyState === 4) {
          let config = {
            url: args[1],
            status: this.status,
            method: args[0],
            data: post_data,
          };
          // 请求后拦截
          http.response({ config, response: this.response });
        }
      },
      false
    );
    return open.apply(this, args);
  };
}

export { listenAndOverwriteFetch, initXMLHttpRequest };
