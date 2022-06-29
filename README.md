# 使用指南
### 安装
直接通过 `<script>`引入
推荐通过 jsdelivr 的 CDN 安装：

```
<script src="https://cdn.jsdelivr.net/npm/log-playback@latest/dist/log-record-error.js"></script>
```
自定义监控config配置

```
<script>
	logConfig = {
		//上报服务器接口
		reportUrl: "http://127.0.0.1:1337/log"
	}
</script>
```
页面初始化即开始监控错误信息，上报错误信息请求中的body.rrwebData中为录制数据

### 回放
直接通过 `<script>`引入回放sdk

```
<script src="https://cdn.jsdelivr.net/npm/log-playback@latest/dist/log-player.js"></script>
```
录屏回放API, 已默认引入了回放需要的css, 不需要额外引入, 参考roweb回放部分: https://github.com/rrweb-io/rrweb/blob/master/guide.zh_CN.md#%E5%9B%9E%E6%94%BE

### 示例Demo

```
git clone https://github.com/twosugar/log-playback.git

cd log-playback/

npm i

npm run start

```

