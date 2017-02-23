/**
 * @file index.jsx
 * @author lee
 * @desc ListView组件的入口文件
 *
 * - 提供「下拉刷新」和「上拉加载更多功能」
 * */

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

class ListView extends Component {
    static propTypes = {

    };

    static defaultProps = {

    };

    constructor(props) {
        super(props);
    }

    render() {
        return <div>hello ListView!</div>
    }
}

export default ListView;