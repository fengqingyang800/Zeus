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