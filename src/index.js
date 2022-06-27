import {
  listenAndOverwriteFetch,
  initXMLHttpRequest,
} from "./error-log/request-error";
import recordLog from "./record/index";

const sendLog = ({ referer, timestamp, date, rrwebData,userAgent, errorMessage }) => {
  const reportUrl = window.logConfig?.reportUrl;
  if (!reportUrl) {
    return;
  }
  fetch(reportUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      referer,
      timestamp,
      date,
      errorMessage,
      userAgent,
      rrwebData,
    }),
    mode: "cors",
  }).catch((error) => {
    console.log(error);
  });
};

if (typeof window !== "undefined" && window) {
  //录屏
  recordLog.startRecording();
  window.onload = () => {
    listenAndOverwriteFetch();
    initXMLHttpRequest();
  };

  window.addEventListener("unhandledrejection", (error) => {
    const res = recordLog.recordError();
    const errorMessage =
      error.message || error.error?.message || error.reason?.message || error.reason;
    const timestamp = Date.now();
    const date = new Date(timestamp).toLocaleString();
    sendLog({
      referer: window.location.href,
      timestamp,
      date,
      errorMessage,
      userAgent: window.navigator?.userAgent,
      rrwebData: JSON.stringify({ res }),
    });
  });

  window.addEventListener("error", (error) => {
    const res = recordLog.recordError();
    const errorMessage =
      error.message || error.error?.message || error.reason?.message || error.target?.outerHTML;
    const timestamp = Date.now();
    const date = new Date(timestamp).toLocaleString();
    sendLog({
      referer: window.location.href,
      timestamp,
      date,
      errorMessage,
      userAgent: window.navigator?.userAgent,
      rrwebData: JSON.stringify({ res }),
    });
  }, true);
}
