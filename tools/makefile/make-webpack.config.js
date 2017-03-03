/**
 * @file make-webpack.config.js
 * @author lee
 *
 * webpack配置文件
 * */

const path = require('path');
const Webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ObjectAssign = require('object-assign');
const utils = require('./utils');
const Config = require('../../config');
const devServerCfg = Config.devServerCfg;

// 环境项
const ENV = process.env.NODE_ENV;
// 项目根路径;
const ROOT_PATH = process.cwd();
// 项目源码路径
const SRC_PATH = path.join(ROOT_PATH, '/examples/src');

const getPager = utils.getPager(SRC_PATH);

// 需要打包的厂商文件
const vendor = [
    'react', 'react-dom', './deps/rem'
];

function getEntry() {
    if(ENV === 'development'){
        vendor.concat([
            `webpack-dev-server/client?http://localhost:${devServerCfg.port}`,
            'webpack/hot/only-dev-server'
        ]);
    }
    return ObjectAssign({vendor}, getPager.entry);
}

function getPlugins() {
    let plugins = [];

    plugins.push(
        new ExtractTextPlugin('[name].css'),
        new Webpack.optimize.CommonsChunkPlugin({name: 'common'})
    );

    plugins = plugins.concat(getPager.htmlPlugins);

    if(ENV === 'development'){
        plugins.push(new Webpack.HotModuleReplacementPlugin());
    }

    return plugins;
}

// webpack配置项
const config = {
    entry: getEntry(),
    output: {
        path: path.resolve(SRC_PATH, '../dist'),
        filename: '[name].js',
        chunkFilename: '[name].chunk.js'
    },
    module: {
        rules: [{
            test: /\.html$/,
            use: 'html-loader'
        },{
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: 'css-loader'
            })
        },{
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: ['css-loader', 'sass-loader']
            })
        },{
            test: /\.(js(x)?)$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['react', 'es2015', 'stage-0'],
                    plugins: ['transform-runtime', 'transform-decorators-legacy']
                }
            }
        },{
            test: /\.(png|jpg|gif|ttf|eot|svg|woff(2)?)(\?[=a-z0-9]+)?$/,
            use: {
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'fonts/[name].[ext]'
                }
            }
        },{
            test: /\.json$/,
            use: 'json'
        }]
    },
    resolve: {
        alias: {
            'component$': path.resolve(ROOT_PATH, 'src'),
            'deps': path.resolve(ROOT_PATH, 'deps'),
            'style': path.resolve(ROOT_PATH, 'style')
        },
        extensions: ['.js', '.jsx']
    },
    plugins: getPlugins()
};

if(ENV === 'development'){
    config.devtool = 'cheap-module-source-map';
}

module.exports = config;
