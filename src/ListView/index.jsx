/**
 * @file index.jsx
 * @author lee
 * @desc ListView组件的入口文件
 *
 * - 提供「下拉刷新」和「上拉加载更多功能」
 * */

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import IScroll from './iscroll';
import { getDefaultTpl } from './template';
import { PullRefreshStatus, LoadMoreStatus } from './status';

class ListView extends Component {
    static propTypes = {
        /****** IScroll配置项 start ******/
        useTransform: PropTypes.bool,
        useTransition: PropTypes.bool,
        HWCompositing: PropTypes.bool,
        bounce: PropTypes.bool,
        click: PropTypes.bool,
        tap: PropTypes.bool,
        disableTouch: PropTypes.bool,
        eventPassthrough: PropTypes.bool, // todo
        freeScroll: PropTypes.bool,
        momentum: PropTypes.bool,
        preventDefault: PropTypes.bool,
        scrollX: PropTypes.bool,
        scrollY: PropTypes.bool,
        startX: PropTypes.number,
        startY: PropTypes.number,
        bounceEasing: PropTypes.shape({
            style: PropTypes.string.isRequired,
            fn: PropTypes.func.isRequired
        }),
        bounceTime: PropTypes.number,
        deceleration: PropTypes.number,
        preventDefaultException: PropTypes.object,
        probeType: PropTypes.number,
        /****** IScroll配置项 end ******/

        /****** ListView配置项 start ******/
        /**
         * 是否使用下拉刷新
         * */
        usePullRefresh: PropTypes.bool,
        /**
         * 下拉刷新回调
         * */
        pullRefreshAction: PropTypes.func,
        /**
         * 是否使用上拉加载更多
         * */
        useLoadMore: PropTypes.bool,
        /**
         * 上拉加载更多回调
         * */
        loadMoreAction: PropTypes.func
        /****** ListView配置项 end ******/

    };

    static defaultProps = {
        // 是否开启transform
        useTransform: true,
        useTransition: true,
        HWCompositing: true,
        bounce: true,
        disableTouch: false,
        freeScroll: false,
        momentum: true,
        preventDefault: true,
        scrollX: false,
        scrollY: true,
        startX: 0,
        startY: 0,
        bounceTime: 600,
        deceleration: 0.0006,
        preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/ },
        probeType: 2,
        usePullRefresh: false,
        pullRefreshAction: null,
        useLoadMore: false,
        loadMoreAction: null
    };

    constructor(props) {
        super(props);

        this.state  = {
            usePullRefresh: props.usePullRefresh,
            pullRefreshStatus: 1,
            useLoadMore: props.useLoadMore,
            loadMoreStatus: 1
        };

        this.isIphone = /iphone/gi.test(navigator.appVersion);
    }

    componentDidMount() {

        // 记录上拉加载、下拉刷子滑块的高度
        this.pullRefreshElHeight = this.pullRefreshEl ? this.pullRefreshEl.offsetHeight : 0;
        this.loadMoreElHeight = this.loadMoreEl ? this.loadMoreEl.offsetHeight : 0;
        const props = this.props;
        // 初始化IScroll对象
        const iscrollIns = this.IScroll = new IScroll(ReactDOM.findDOMNode(this), {
            useTransform: props.useTransform,
            useTransition: props.useTransition,
            HWCompositing: props.HWCompositing,
            bounce: props.bounce,
            disableTouch: props.disableTouch,
            freeScroll: props.freeScroll,
            momentum: props.momentum,
            preventDefault: props.preventDefault,
            scrollX: props.scrollX,
            scrollY: props.scrollY,
            startX: props.startX,
            startY: props.startY,
            bounceEasing: props.bounceEasing,
            bounceTime: props.bounceTime,
            deceleration: props.deceleration,
            preventDefaultException: props.preventDefaultException,
            probeType: props.probeType
        });

        // 为IScroll绑定scroll事件
        iscrollIns.on('scroll', () => {
            // 为iphone做兼容处理
            if (this.isIphone &&
                (iscrollIns.pointY < 30 || iscrollIns.pointY > document.documentElement.clientHeight - 30)) {
                iscrollIns.resetPosition(400);
            }

            const {
                usePullRefresh,
                pullRefreshStatus,
                useLoadMore,
                loadMoreStatus
            } = this.state;

            // 下拉刷新，首先得有
            if(usePullRefresh) {
                if(iscrollIns.y >= this.pullRefreshElHeight && pullRefreshStatus === 1) {
                    this.setState({
                        pullRefreshStatus: 2
                    });
                } else if(iscrollIns.y < this.pullRefreshElHeight && pullRefreshStatus === 2) {
                    this.setState({
                        pullRefreshStatus: 1
                    });
                }
            }

            // 上拉加载更多，首先得有
            if(useLoadMore) {
                if(iscrollIns.maxScrollY > iscrollIns.y && loadMoreStatus === 1) {
                    this.setState({
                        loadMoreStatus: 2
                    });
                } else if(iscrollIns.maxScroll <= iscrollIns.y && loadMoreStatus === 2) {
                    this.setState({
                        loadMoreStatus: 1
                    });
                }
            }
        });

        // 为IScroll绑定scrollEnd事件
        iscrollIns.on('scrollEnd', () => {
            const {
                usePullRefresh,
                pullRefreshStatus,
                useLoadMore,
                loadMoreStatus
            } = this.state;

            if(usePullRefresh && iscrollIns.y >= this.pullRefreshElHeight) {
                if(pullRefreshStatus === 3) {
                    iscrollIns.scrollTo(iscrollIns.x, this.pullRefreshElHeight, 400);
                } else {
                    this.setState({
                        pullRefreshStatus: 3
                    }, () => {
                        iscrollIns.scrollTo(iscrollIns.x, this.pullRefreshElHeight, 400);
                        this.loadData('refresh');
                    });
                }
            }

            if(useLoadMore &&
               iscrollIns.y < iscrollIns.maxScrollY &&
               loadMoreStatus !== 4 &&
               loadMoreStatus !== 3) {
                this.setState({
                    loadMoreStatus: 3
                }, () => {
                    this.loadData('load');
                });
            }
        });
    }

    loadData(type) {
        const promise = new Promise((resolve, reject) => {
            switch(type){
                case 'refresh':
                    this.props.pullRefreshAction(resolve, reject);
                    break;
                case 'load':
                    this.props.loadMoreAction(resolve, reject);
                    break;
                default:
                    break;
            }
        });

        promise
            .then(() => {
                _loadDataHandle(type, 4);
            })
            .catch(() => {
                _loadDataHandle(type, 5);
            });
    }

    _loadDataHandle(type, code) {
        if(type === 'refresh'){
            this.setState({
                pullRefreshStatus: code
            }, setTimeout(() => {
                this.setState({
                    pullRefreshStatus: 1
                }, () => {
                    this.IScroll.scrollTo(iscrollIns.x, -this.pullRefreshElHeight, 400);
                    this.IScroll.refresh();
                });
            }, 500));
        } else {
            this.IScroll.refresh();
        }
    }

    render() {
        const {
            usePullRefresh,
            pullRefreshStatus,
            useLoadMore,
            loadMoreStatus
        } = this.state;

        return (
            <div className="silk-listview-wrapper">
                <div className="silk-listview-scroller">
                    {
                        usePullRefresh ?
                            getDefaultTpl(PullRefreshStatus[pullRefreshStatus], 'pullRefreshEl') :
                            null
                    }
                    { this.props.children }
                    {
                        useLoadMore ?
                            getDefaultTpl(LoadMoreStatus[loadMoreStatus], 'loadMoreEl') :
                            null
                    }
                </div>
            </div>
        )
    }
}

export default ListView;