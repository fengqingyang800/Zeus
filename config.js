/**
 * @file config.js
 * @author lee
 *
 * 项目配置文件
 * */

const path = require('path');

const devServerPort = 4000;
const proxyPort = 4001;

const config = {
    devServerCfg: {
        publicPath: '/',
        port: devServerPort,
        hot: true,
        stats: {
            color: true
        },
        proxy: {
            '**/component\.*': 'http://localhost:' + proxyPort
        }
    },
    porxyCfg: {
        port: proxyPort,
        rules: [{
            pattern: /https?:\/\/[\w\.]*(?::\d+)?\/.+\/(component.+)/,
            responder: path.join(process.cwd(), '/mock/') + '$1.json'
        }]
    }
};

module.exports = config;