/**
 * @file dev.server.js
 * @author lee
 *
 * 开发环境
 * */

const path = require('path');
const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const nproxy = require('../tools/proxy/nproxy');
const Config = require('../config');
const makeWebpackCfg = require('../tools/makefile/make-webpack.config');
const devServerCfg = Config.devServerCfg;
const porxyCfg = Config.porxyCfg;

// 启动mock服务器nproxy
nproxy(porxyCfg.port, porxyCfg);
// 启动WebpackDevServer
const Compiler = Webpack(makeWebpackCfg);
const Server = new WebpackDevServer(Compiler, devServerCfg);
Server.listen(devServerCfg.port, devServerCfg.host, (e) => {
    if(e) {
        console.error(e);
    } else {
        console.log('\033[36m[webpack-dev-server] ' + `webpack-dev-server started on ${devServerCfg.port} !` + ' \033[0m');
        console.log('\033[36m[webpack-dev-server] ' + `Open http://localhost:${devServerCfg.port}in your browser!` + ' \033[0m');
    }
})