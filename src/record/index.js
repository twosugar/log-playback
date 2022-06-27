/*
 * @Description: 记录
 * @Date: 2022-06-24 17:07:17
 * @FilePath: /log-playback/src/record/index.js
 * @LastEditTime: 2022-06-27 17:51:11
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

  async startRecording() {
    await this.insertRecordScript();
    if (!window.rrwebRecord) {
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
}

export default new Record();
