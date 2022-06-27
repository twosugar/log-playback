/*
 * @Description: 播放
 * @Date: 2022-06-27 14:26:21
 * @FilePath: /log-playback/src/player/index.js
 * @LastEditTime: 2022-06-27 14:46:30
 */

class Player {
  constructor() {}

  async init() {
    await Promise.all([this.insertVideoPlayerScript(), this.insertVideoCss()]);
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
}

let rrwebPlayer = window.rrwebPlayer;
if (!rrwebPlayer) {
  new Player().init();
  rrwebPlayer = window.rrwebPlayer;
}

export default rrwebPlayer;
