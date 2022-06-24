/*
 * @Description:
 * @Date: 2022-06-24 17:07:17
 * @FilePath: /log-playback/src/record/index.js
 * @LastEditTime: 2022-06-24 19:07:18
 */

// import * as rrweb from "rrweb";

class Record {
  constructor() {
    this.eventsMatrix = [[]];
  }

  insertRecordScript() {
    return new Promise((resolve, reject) => {
      const Script = document.createElement("script");
      Script.setAttribute("type", "text/javascript");
      Script.setAttribute(
        "src",
        "https://cdn.jsdelivr.net/npm/rrweb@latest/dist/record/rrweb-record.min.js"
      );
      document.head.insertBefore(Script, document.head.lastChild);
      Script.onload = () => {
        resolve();
      };
      Script.onerror = () => {
        reject(`rrweb record onload err`);
      };
    });
  }

  insertVideoPlayerScript() {
    return new Promise((resolve, reject) => {
      const Script = document.createElement("script");
      Script.setAttribute("type", "text/javascript");
      Script.setAttribute(
        "src",
        "https://cdn.jsdelivr.net/npm/rrweb-player@latest/dist/index.js"
      );
      document.head.insertBefore(Script, document.head.lastChild);
      Script.onload = () => {
        resolve();
      };
      Script.onerror = () => {
        reject(`rrweb player onload err`);
      };
    });
  }

  insertVideoCss() {
    return new Promise((resolve, reject) => {
      const Link = document.createElement("link");
      Link.setAttribute("rel", "stylesheet");
      Link.setAttribute(
        "href",
        "https://cdn.jsdelivr.net/npm/rrweb-player@latest/dist/style.css"
      );
      document.head.insertBefore(Link, document.head.lastChild);
      Link.onload = () => {
        resolve();
      };
      Link.onerror = () => {
        reject(`rrweb css onload err`);
      };
    });
  }

  async startRecording() {
    await this.insertRecordScript();
    if (!rrwebRecord) {
      return;
    }
    rrwebRecord({
      emit: (event, isCheckout) => {
        // isCheckout 是一个标识，告诉你重新制作了快照
        if (isCheckout) {
          this.eventsMatrix.push([]);
        }
        if (this.eventsMatrix.length > 20) {
          //限制最多20个快照
          this.eventsMatrix.shift();
        }
        const lastEvents = this.eventsMatrix[this.eventsMatrix.length - 1];
        lastEvents.push(event);
      },
      // checkoutEveryNth: 200, // 每 200 个 event 重新制作快照
      checkoutEveryNms: 20000, // 每20秒重新制作制作一个快照
    });
  }

  recordError() {
    const len = this.eventsMatrix.length;
    let events = this.eventsMatrix;
    if (len >= 2) {
      events = this.eventsMatrix[len - 2].concat(this.eventsMatrix[len - 1]);
    } else {
      events = this.eventsMatrix[0];
    }
    return events;
  }

  async playVideo(events) {
    await Promise.all([this.insertVideoPlayerScript(), this.insertVideoCss()]);
    const replayer = new rrwebPlayer({
      target: document.body, // 可以自定义 DOM 元素
      // 配置项
      props: {
        events,
      },
    });
    replayer.play();
  }
}

export default new Record();
