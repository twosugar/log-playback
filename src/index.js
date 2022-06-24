import {
  listenAndOverwriteFetch,
  initXMLHttpRequest,
} from "./error-log/request-error";
import recordLog from "./record/index";

if (typeof window !== "undefined" && window) {
  //录屏
  recordLog.startRecording();
  window.onload = () => {
    listenAndOverwriteFetch();
    initXMLHttpRequest();
  };

  window.addEventListener("unhandledrejection", (error) => {
    const str = error.message || error.error?.message || error.reason?.message;
    if (str.includes("rrweb")) {
      //排除rrweb本身的报错 避免死循环
      return;
    }
    const res = recordLog.recordError();
    recordLog.playVideo(res);
  });

  window.addEventListener("error", (error) => {
    const str = error.message || error.error.message || error.reason.message;
    if (str.includes("rrweb")) {
      //排除rrweb本身的报错 避免死循环
      return;
    }
    const res = recordLog.recordError();
    recordLog.playVideo(res);
  });
}
