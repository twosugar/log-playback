/*
 * @Description: 
 * @Author: ytang5
 * @Date: 2022-06-27 15:09:29
 * @LastEditors: ytang5
 * @FilePath: /log-playback/server.js
 * @LastEditTime: 2022-06-27 19:37:33
 */
const express = require('express'); // 引入 express 模块
const app = express();
// 配置cros跨域请求中间件
const cors = require('cors')
const bodyParser = require('body-parser');
let mongodb = {} // 模拟数据库

app.use(cors())
app.use(bodyParser.json({limit: '5mb'}))
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}))
app.post('/log', function (req, res) {
    mongodb = req.body
    res.status(200)
    res.json({
        success: true,
        status: 200
    })
});

app.get('/getErrorLog', function (req, res) {
    res.status(200)
    res.json({
        success: true,
        status: 200,
        data: mongodb
    })
});

app.listen(1337, () => {
    console.log('127.0.0.1:1137')
})