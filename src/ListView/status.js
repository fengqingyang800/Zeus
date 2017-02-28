/**
 * @file status.js
 * @author lee
 * @desc
 *      下拉刷新，上拉加载更多的状态文件
 * */

export default {
    pullRefreshStatus: {
        1: {
            code: '&#xf07b;',
            text: '下拉即可刷新',
            status: ''
        },
        2: {
            code: '&#xf079;',
            text: '释放立即刷新',
            status: ''
        },
        3: {
            code: '&#xf089;',
            text: '努力加载中...',
            status: 'silk-listview-loading'
        },
        4: {
            code: '&#xf089;',
            text: '刷新成功',
            status: 'silk-listview-success'
        },
        5: {
            code: '&#xf089;',
            text: '刷新失败',
            status: 'silk-listview-fail'
        },
    },
    loadMoreStatus: {
        1: {
            code: '&#xf079;',
            text: '上拉加载更多',
            status: ''
        },
        2: {
            code: '&#xf07b;',
            text: '释放立即加载',
            status: ''
        },
        3: {
            code: '&#xf089;',
            text: '努力加载中...',
            status: 'silk-listview-loading'
        },
        4: {
            code: '&#xf089;',
            text: '别扯了，我是有底线的',
            status: ''
        },
    }
}