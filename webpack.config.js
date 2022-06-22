const path = require('path')

module.exports = {
    entry: path.resolve(__dirname, 'src/index.js'),
    output: {
        // export to AMD, CommonJS, or window
        libraryTarget: 'umd',
        globalObject: 'this',
        path: path.resolve(__dirname, 'dist'),
        filename: process.env.mode === 'production' ? 'bundle.min.js' : 'bundle.js'
    },
    devServer: {
        static: './src',
        compress: true, // 开启gzip压缩
        port: 8088, // 启动的端口号
        open: true, // 启动服务后自动打开浏览器
        hot: true,  // 不配置此项也能热更新，在 webpack 5 中 HMR 已自动支持。
      },
}