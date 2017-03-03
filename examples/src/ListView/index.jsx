/**
 * @file index.jsx
 * @author lee
 *
 * ListView示例
 * */
import React, {PropTypes, PureComponent} from 'react';
import ReactDOM from 'react-dom';
import { ListView } from 'component';
import {ajax} from 'deps/zepto';

import 'style/reset/index.scss';

class Example extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            lists: []
        };

        this.index = 1;

        this.page = 1;

        this.maxCount = 5;

        this.fetchData = this.fetchData.bind(this);

        this.pullDownAction = this.pullDownAction.bind(this);
        this.pullUpAction = this.pullUpAction.bind(this);

        this.getContent = this.getContent.bind(this);
    }

    componentDidMount() {
        this.fetchData('refresh');
    }

    /**
     * 获取数据
     * */
    fetchData(type, resolve, reject) {
        const self = this;
        $.ajax({
            url: 'component.listview',
            type: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'gw-rest-action': 'component.listview'
            }
        }).done((data) => {
            if(resolve) {
                resolve();
            }

            let lists = data.value.lists;

            if(this.index > 5) {
                lists = [];
            }

            this.setState({
                lists: type === 'refresh' ? lists : this.state.lists.concat(lists)
            });
            this.index = 1;
        }).fail((xhr) => {
            if(reject) {
                reject();
            }
            console.log(xhr.code);
        });
    }

    /**
     * 下拉刷新动作
     * */
    pullDownAction(resolve, reject) {
        this.index = 1;
        this.fetchData('refresh', resolve, reject);
    }

    /**
     * 上拉加载更多动作
     * */
    pullUpAction(resolve, reject) {
        this.fetchData('load', resolve, reject);
    }

    /**
     * 获取列表内容
     * */
    getContent() {
        return this.state.lists.map((list) => {
            return <li key={'list' + this.index} className="list-view-item">{this.index++ + '. ' + list}</li>;
        })
    }

    render() {
        return (
            <ListView
                pullDownAction={this.pullDownAction}
                pullUpAction={this.pullUpAction}
            >
                <ul>{this.getContent()}</ul>
            </ListView>
        )
    }
}

ReactDOM.render(
    <Example />, document.getElementById('root')
)