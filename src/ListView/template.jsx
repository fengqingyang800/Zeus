/**
 * @file template.jsx
 * @author lee
 * @desc ListView模版
 *
 * - 提供「下拉刷新」和「上拉加载更多功能」
 * */

const template = {
    /**
     * 获取下拉刷新、上拉加载更多DOM模版
     *
     * code: 字体图标编码
     * text: 需要显示的文字
     * status: 加载的状态
     * */
    getDefaultTpl: (options, ref) => {
        return (
            <div
                className="silk-listview-loadtip"
                ref={ref}
            >
                <i className={`silk-listview-icon ${options.status}`}>{options.code}</i>
                <div className="silk-listview-text">{options.text}</div>
            </div>
        );
    }
}

export default template;


getElementById(id) {
    let html = '';

    switch(id) {
        case 'pulldown':
            switch(this.state.pullDownStatus) {
                case 0:
                    html = <div className="jg-listview-pull-wrap"><span>{'下拉刷新'}</span></div>;
                    break;
                case 1:
                    html = (<div className="jg-listview-pull-wrap">
                        <div className="jg-listview-icon">
                            <LoadingIcon iconSize={28} />
                        </div>
                        <span className="jg-listview-text">{'继续下拉刷新'}</span>
                    </div>);
                    break;
                case 2:
                    html = (<div className="jg-listview-pull-wrap">
                        <div className="jg-listview-icon">
                            <LoadingIcon iconSize={28} />
                        </div>
                        <span className="jg-listview-text">{'松手即可刷新'}</span>
                    </div>);
                    break;
                case 3:
                    html = (<div className="jg-listview-pull-wrap">
                        <div className="jg-listview-icon">
                            <LoadingIcon iconSize={28} />
                        </div>
                        <span className="jg-listview-text">{'刷新中...'}</span>
                    </div>);
                    break;
                case 4:
                    html = <div className="jg-listview-pull-wrap"><span>{'刷新成功'}</span></div>;
                    break;
                case 5:
                    html = <div className="jg-listview-pull-wrap"><span>{'刷新失败'}</span></div>;
                    break;
                default:
                    break;
            }
            break;
        case 'pullup':
            switch(this.state.pullUpStatus) {
                case 0:
                    html = <div className="jg-listview-pull-wrap"><span>{'上拉加载更多'}</span></div>;
                    break;
                case 1:
                    html = (<div className="jg-listview-pull-wrap">
                        <div className="jg-listview-icon">
                            <LoadingIcon iconSize={28} />
                        </div>
                        <span className="jg-listview-text">{'松手即可加载更多'}</span>
                    </div>);
                    break;
                case 2:
                    html = (<div className="jg-listview-pull-wrap">
                        <div className="jg-listview-icon">
                            <LoadingIcon iconSize={28} />
                        </div>
                        <span className="jg-listview-text">{'加载中...'}</span>
                    </div>);
                    break;
                case 3:
                    html = <div className="jg-listview-pull-wrap"><span>{'加载成功'}</span></div>;
                    break;
                case 4:
                    html = <div className="jg-listview-pull-wrap"><span>{'加载失败'}</span></div>;
                    break;
                default:
                    break;
            }
            break;
        default:
            break;
    }

    return html;
}