/**
 * @file utils.js
 * @author lee
 *
 * webpack配置中用到的工具函数
 * */

const path = require('path');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');

function getEntryName(filePath) {
    const pathArr = filePath.split('/');
    const len = pathArr.length;
    let folderName;
    let fileName;

    if(pathArr && pathArr.length >= 2) {
        folderName = pathArr[len-2];
        fileName = pathArr[len-1];

        fileName = fileName.substring(0, fileName.lastIndexOf('.'));
    }

    return `${folderName}/${fileName}`;
}

function getJsFiles(path) {
    let files = {};
    let jsFiles = glob.sync(path);

    jsFiles.forEach(filePath => {
        let entryName = getEntryName(filePath);
        files[entryName] = filePath;
    });

    return files;
}

module.exports = {
    getPager: function(entryFolder) {
        const jsFiles = getJsFiles(`${entryFolder}/**/*.{js,jsx}`);
        const htmlPlugins = [];
        const entry = {};

        const pages = glob.sync(`${entryFolder}/**/*.html`);

        pages.forEach( filePath => {
            const entryName = getEntryName(filePath);
            const conf = {};

            if(entryName in jsFiles) {
                conf.filename = `${entryName}.html`;
                conf.template = filePath;
                conf.chunks = ['common', 'vendor', entryName];
                conf.inject = 'body';

                htmlPlugins.push(new HtmlWebpackPlugin(conf));

                entry[entryName] = jsFiles[entryName];
            }
        });

        return {
            htmlPlugins: htmlPlugins,
            entry: entry
        }
    }
};