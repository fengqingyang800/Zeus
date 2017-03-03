/**
 * @file iscroll
 * @author lee修改子IScroll
 * @desc
 *      为适应移动端业务部分，抽离IScroll
 * */
import utils from './utils';

export default class IScroll {
    constructor(el, options){
        // 容器DOM
        this.wrapper = typeof el === 'string' ? document.querySelector(el) : el;
        // 滑块DOM
        this.scroller = this.wrapper.children[0];
        // 缓存滑块样式，提高效率
        this.scrollerStyle = this.scroller.style;

        // 默认选项
        this.options = {
            // 是否禁用touch事件
            disableTouch: !utils.hasTouch,
            // 滑块在容器左上角处的坐标值
            startX: 0,
            startY: 0,
            // 默认是垂直滚动
            scrollY: true,
            // 方向锁的阈值,当不是自由滚动时，通过此阈值判断是垂直滚动还是水平滚动
            directionLockThreshold: 5,
            // 是否开启东动量选项
            momentum: true,
            // 是否有回弹效果
            bounce: true,
            // 回弹默认时间
            bounceTime: 600,
            // 回弹动画函数
            bounceEasing: '',
            // 是否阻止touch事件的默认行为
            preventDefault: true,
            // 遇到以下元素不会禁止默认行为
            preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/ },
            // 是否开启硬件加速
            HWCompositing: true,
            // 是否开启transition动画
            useTransition: true,
            // 是否开始transform
            useTransform: true
        }

        // 进行选贤合并，经用户传入的选项和默认选项合并
        for ( var i in options ) {
            this.options[i] = options[i];
        }

        // 修正选项  是否启用硬件加速
        this.translateZ = this.options.HWCompositing && utils.hasPerspective ? ' translateZ(0)' : '';

        this.options.useTransition = utils.hasTransition && this.options.useTransition;
        this.options.useTransform = utils.hasTransform && this.options.useTransform;

        this.options.eventPassthrough = this.options.eventPassthrough === true ? 'vertical' : this.options.eventPassthrough;
        this.options.preventDefault = !this.options.eventPassthrough && this.options.preventDefault;

        // 如果开启了eventPassthrough,那么还需要锁定方向机制
        this.options.freeScroll = this.options.freeScroll && !this.options.eventPassthrough;
        this.options.directionLockThreshold = this.options.eventPassthrough ? 0 : this.options.directionLockThreshold;

        this.options.bounceEasing = typeof this.options.bounceEasing == 'string' ? utils.ease[this.options.bounceEasing] || utils.ease.circular : this.options.bounceEasing;

        if ( this.options.tap === true ) {
            this.options.tap = 'tap';
        }

        if (!this.options.useTransition && !this.options.useTransform) {
            if(!(/relative|absolute/i).test(this.scrollerStyle.position)) {
                this.scrollerStyle.position = "relative";
            }
        }

        // 如果probeType = 3，则禁用transition动画，调用_animate函数执行，这样可以使scroll事件的响应接近像素级别
        if ( this.options.probeType == 3 ) {
            this.options.useTransition = false;
        }

        this.x = 0;
        this.y = 0;
        this.directionX = 0;
        this.directionY = 0;
        this._events = {};

        // 初始化事件
        this._initEvent();
        // 刷新列表
        this.refresh();
        // 滚动到startX和startY位置
        this.scrollTo(this.options.startX, this.options.startY);
        this.enable();
    }

    /**
     * 初始化事件
     *
     * @param
     *      flag - 标志添加或删除事件
     * */
    _initEvent(flag) {
        let eventType = flag ? utils.removeEvent : utils.addEvent;

        // 处理click事件
        if(this.options.click) {
            eventType(this.wrapper, 'click', this, true);
        }

        // 处理touch事件
        if ( utils.hasTouch && !this.options.disableTouch ) {
            eventType(this.wrapper, 'touchstart', this);
            eventType(window, 'touchmove', this);
            eventType(window, 'touchcancel', this);
            eventType(window, 'touchend', this);
        }

        // 处理transitionend事件
        eventType(this.scroller, utils.prefixStyle('transitionsend'), this);
    }

    /**
     * 执行绑定的事件
     */
    _execEvent(type) {
        if(!this._events[type]) return;

        let i = 0;
        let len = this._events.length;

        if(!len) return;

        for(; i < len; i++) {
            this._events[type][i].apply(this, [].slice.call(arguments, 1))
        }
    }

    /**
     * 移动滑块位置函数
     * */
    _translate(x, y){
        // 如果支持transform这使用，不支持就使用left top
        if ( this.options.useTransform ) {
            this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;
        } else {
            x = Math.round(x);
            y = Math.round(y);
            this.scrollerStyle.left = x + 'px';
            this.scrollerStyle.top = y + 'px';
        }

        // 重置x,y的值
        this.x = x;
        this.y = y;
    }

    /**
     * 设置transitionTime
     * */
    _transitionTime(time = 0) {
        if (!this.options.useTransition) return;

        let durationProp = utils.style.transitionDuration;
        if(!durationProp) return;

        // 滑块的样式  将滑块的transitionDuration样式属性设置一下，如果时间为0 则瞬间停止
        this.scrollerStyle[durationProp] = time + 'ms';

        // time为0 并且是不支持的安卓
        if ( !time && utils.isBadAndroid ) {
            // 则将transitionDuration属性设置为极短
            this.scrollerStyle[durationProp] = '0.0001ms';
            utils.requestAnimationFrame(() => {
                if(this.scrollerStyle[durationProp] === '0.0001ms') {
                    this.scrollerStyle[durationProp] = '0s';
                }
            });
        }
    }

    /**
     * 设置tarnsition动效函数
     * */
    _transitionTimingFunction (easing) {
        this.scrollerStyle[utils.style.transitionTimingFunction] = easing;
    }

    /**
     * 动画函数
     */
    _animate(destX, destY, duration, easingFn) {
        const that = this;
        let startX = this.x;
        let startY = this.y;
        let startTime = utils.getTime();
        let destTime = startTime + duration;

        function step() {
            let now = utils.getTime();
            let newX;
            let newY;
            let easing;

            // 如果当前时间大于持续时间结束动画
            if ( now >= destTime ) {
                that.isAnimating = false;
                that._translate(destX, destY);

                if ( !that.resetPosition(that.options.bounceTime) ) {
                    that._execEvent('scrollEnd');
                }

                return;
            }

            now = ( now - startTime ) / duration;
            easing = easingFn(now);
            newX = ( destX - startX ) * easing + startX;
            newY = ( destY - startY ) * easing + startY;
            that._translate(newX, newY);

            if ( that.isAnimating ) {
                utils.requestAnimationFrame(step);
            }
            // 不是严格意义上的像素级别  只是模拟像素级别  滑动慢，可能16ms之内没有变化，如果滑动的快，可能16ms内运动了10多像素，完全和滑动的快慢有关系
            if ( that.options.probeType == 3 ) {
                that._execEvent('scroll');
            }
        }

        this.isAnimating = true;
        step();
    }

    /**
     * touchStart事件处理器
     */
    _start(e) {
        // 如果IScroll被禁用或者已经被启动并且被启动的事件类型不是该事件类型
        if ( !this.enabled || (this.initiated && utils.eventType[e.type] !== this.initiated) ) {
            return;
        }
        // touchStart阻止默认事件后，click，mouse事件也会被阻止
        if ( this.options.preventDefault && !utils.isBadAndroid && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) {
            e.preventDefault();
        }

        let point = e.touches ? e.touches[0] : e;
        let pos;

        // 事件启动 - 事件类型
        this.initiated	= utils.eventType[e.type];
        this.moved		= false;
        this.distX		= 0;
        this.distY		= 0;
        this.directionX = 0;
        this.directionY = 0;
        this.directionLocked = 0;

        // 取得touchStart的时间
        this.startTime = utils.getTime();

        // 如果支持transition并且正在执行transition动画
        if ( this.options.useTransition && this.isInTransition ) {
            // 将动画暂停
            this._transitionTime();
            // 将IScroll的状态修改一下
            this.isInTransition = false;
            // 得到计算的位置
            pos = this.getComputedPosition();
            this._translate(Math.round(pos.x), Math.round(pos.y));
            // 停止滚动
            this._execEvent('scrollEnd');
        } else if ( !this.options.useTransition && this.isAnimating ) {
            // 设置为false后  requestAnimationFrame不会在执行
            this.isAnimating = false;
            this._execEvent('scrollEnd');
        }

        // 将当前位置设置为开始滚动的初始位置
        this.startX    = this.x;
        this.startY    = this.y;
        this.absStartX = this.x;
        this.absStartY = this.y;
        // 手指的位置
        this.pointX    = point.pageX;
        this.pointY    = point.pageY;
        // 触发钩子  beforeScrollStart
        this._execEvent('beforeScrollStart');
    }

    /**
     * touchMove事件处理器
     */
    _move(e) {
        // 如果禁用了IScroll或者触发的事件跟初始值不一样 直接返回
        if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {
            return;
        }

        if ( this.options.preventDefault ) {	// increases performance on Android? TODO: check!
            e.preventDefault();
        }

        let point = e.touches ? e.touches[0] : e;
        // 手指在X／Y轴上的增量
        let deltaX	= point.pageX - this.pointX;
        let deltaY = point.pageY - this.pointY;
        let timestamp	= utils.getTime();
        let newX;
        let newY;
        // 增量绝对值
        let absDistX;
        let absDistY;

        // 更新pointX 和 pointY
        this.pointX		= point.pageX;
        this.pointY		= point.pageY;

        this.distX		+= deltaX;
        this.distY		+= deltaY;
        absDistX		= Math.abs(this.distX);
        absDistY		= Math.abs(this.distY);

        // 如果时间间隔相差300ms 并且 实际滚动的距离小于10像素
        if ( timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10) ) {
            return;
        }

        // 只让其在一个方向上滚动  directionLocked 初始值为0  directionLockThreshold = 5
        if ( !this.directionLocked && !this.options.freeScroll ) {
            // 如果水平方向移动的绝对值 > 垂直方向移动的绝对值 + 5 则直接锁定运动方向为水平方向
            if ( absDistX > absDistY + this.options.directionLockThreshold ) {
                this.directionLocked = 'h';		// 锁住水平方向的滚动
            } else if ( absDistY >= absDistX + this.options.directionLockThreshold ) {
                this.directionLocked = 'v';		// 锁住垂直方向的滚动
            } else {
                this.directionLocked = 'n';		// 不锁
            }
        }

        // 有些时候你想保留原生纵向的滚动条但想为横向滚动条增加iScroll功能（比如走马灯）。
        // 设置这个属性为true并且iScroll区域只将影响横向滚动，纵向滚动将滚动整个页面。
        if ( this.directionLocked == 'h' ) {
            // 水平方向滚动时 锁住 全局垂直滚动
            if ( this.options.eventPassthrough == 'vertical' ) {
                e.preventDefault();
            } else if ( this.options.eventPassthrough == 'horizontal' ) {
                // 若为是水平方向的eventPassthrough，将启动设置为false 则永远不会执行_move函数
                this.initiated = false;
                return;
            }
            // 始终将Y方向的位移设置为0
            deltaY = 0;
        } else if ( this.directionLocked == 'v' ) {
            if ( this.options.eventPassthrough == 'horizontal' ) {
                e.preventDefault();
            } else if ( this.options.eventPassthrough == 'vertical' ) {
                this.initiated = false;
                return;
            }
            deltaX = 0;
        }

        // 允许垂直或者水平滚动时 才会将deltaX deltaY赋值 否则为0
        deltaX = this.hasHorizontalScroll ? deltaX : 0;
        deltaY = this.hasVerticalScroll ? deltaY : 0;

        // 新的位置
        newX = this.x + deltaX;
        newY = this.y + deltaY;

        // 如果超出了边界则放慢速度
        if ( newX > 0 || newX < this.maxScrollX ) {
            newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
        }
        // 大于0  则说明拉到下边位置了  或者已经超出了顶端
        if ( newY > 0 || newY < this.maxScrollY ) {
            newY = this.options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
        }

        // 设置方向 若 deltaX大于0  说明是在向下滑动  小于0 向上滑动  等于0 不动
        this.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
        this.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

        // 如果现在还没动 就执行钩子函数  scrollStart
        if ( !this.moved ) {
            this._execEvent('scrollStart');
        }

        // 将其设置为true
        this.moved = true;

        // 运动到新的位置
        this._translate(newX, newY);

        // 如果propbeType = 1 最少大于300ms执行一次scroll事件
        if ( timestamp - this.startTime > 300 ) {
            // 更新开始时间
            this.startTime = timestamp;
            // 更新起始位置
            this.startX = this.x;
            this.startY = this.y;

            // probeType == 1的时候每300ms触发一次滚动事件
            if ( this.options.probeType == 1 ) {
                this._execEvent('scroll');
            }
        }

        // 大于1的时候 每执行一次touchMove则会执行一次scroll事件
        if ( this.options.probeType > 1 ) {
            this._execEvent('scroll');
        }
    }

    /**
     * touchEnd事件处理器
     */
    _end(e) {
        if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {
            return;
        }

        if ( this.options.preventDefault && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) {
            e.preventDefault();
        }

        let point = e.changedTouches ? e.changedTouches[0] : e;
        let momentumX;
        let momentumY;
        let duration = utils.getTime() - this.startTime;
        let newX = Math.round(this.x);
        let newY = Math.round(this.y);
        let distanceX = Math.abs(newX - this.startX);
        let distanceY = Math.abs(newY - this.startY);
        let time = 0;
        let easing = '';

        this.isInTransition = 0;
        this.initiated = 0;
        this.endTime = utils.getTime();

        // 如果超出边界 需要重置
        if ( this.resetPosition(this.options.bounceTime) ) {
            return;
        }

        this.scrollTo(newX, newY);

        // 我们滚动的小于10px
        if ( !this.moved ) {
            // 这里处理tap事件
            if ( this.options.tap ) {
                utils.tap(e, this.options.tap);
            }

            if ( this.options.click ) {
                utils.click(e);
            }

            this._execEvent('scrollCancel');
            return;
        }

        // 如果需要的话开始动量动画
        if ( this.options.momentum && duration < 300 ) {
            momentumX = this.hasHorizontalScroll ? utils.momentum(this.x, this.startX, duration, this.maxScrollX, this.options.bounce ? this.wrapperWidth : 0, this.options.deceleration) : { destination: newX, duration: 0 };
            momentumY = this.hasVerticalScroll ? utils.momentum(this.y, this.startY, duration, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0, this.options.deceleration) : { destination: newY, duration: 0 };
            newX = momentumX.destination;
            newY = momentumY.destination;
            time = Math.max(momentumX.duration, momentumY.duration);
            this.isInTransition = 1;
        }

        if ( newX != this.x || newY != this.y ) {
            // 当超出边界时 改变缓动函数
            if ( newX > 0 || newX < this.maxScrollX || newY > 0 || newY < this.maxScrollY ) {
                easing = utils.ease.quadratic;
            }

            this.scrollTo(newX, newY, time, easing);
            return;
        }

        this._execEvent('scrollEnd');
    }

    /**
     * transition动画结束之后执行的函数
     */
    _transitionEnd(e) {
        if ( e.target != this.scroller || !this.isInTransition ) return;

        this._transitionTime();

        // resetPosition 位置没变  返回false  变了返回true
        if ( !this.resetPosition(this.options.bounceTime) ) {
            this.isInTransition = false;
            this._execEvent('scrollEnd');
        }
    }

    /**
     * 绑定事件
     * */
    on(type, fn) {
        let list = this._events[type];

        if(!list){
            list = [];
        }

        list.push(fn);
    }

    /**
     * 解绑事件
     * */
    off(type, fn) {
        let list = this._events[type];

        if (!list) return;

        let index = list.indexOf(fn);

        if (index > -1) {
            list.splice(index, 1)
        }
    }

    /**
     * 启用IScroll
     * */
    enable() {
        this.enabled = true;
    }

    /**
     * 禁用IScroll
     * */
    disable() {
        this.enabled = false;
    }

    /**
     * 销毁IScroll
     * */
    destory() {
        this._initEvents(true);
        this._execEvent('destory');
    }

    /**
     * 刷新
     * */
    refresh() {
        var rf = this.wrapper.offsetHeight;		// 强制重排，为什么？

        // 容器内部宽高
        this.wrapperWidth	= this.wrapper.clientWidth;
        this.wrapperHeight	= this.wrapper.clientHeight;

        // 滑块的宽高
        this.scrollerWidth	= this.scroller.offsetWidth;
        this.scrollerHeight	= this.scroller.offsetHeight;

        // 可滑动的最大宽度
        this.maxScrollX		= this.wrapperWidth - this.scrollerWidth;
        // 可滑动的最大高度
        this.maxScrollY		= this.wrapperHeight - this.scrollerHeight;

        // 是否可以水平、垂直滚动
        this.hasHorizontalScroll	= this.options.scrollX && this.maxScrollX < 0;
        this.hasVerticalScroll		= this.options.scrollY && this.maxScrollY < 0;

        if ( !this.hasHorizontalScroll ) {
            this.maxScrollX = 0;
            this.scrollerWidth = this.wrapperWidth;
        }

        if ( !this.hasVerticalScroll ) {
            this.maxScrollY = 0;
            this.scrollerHeight = this.wrapperHeight;
        }

        // 初始化终止时间，当滚动的时候需要
        this.endTime = 0;
        this.directionX = 0;
        this.directionY = 0;

        // 容器的偏移量
        this.wrapperOffset = utils.offset(this.wrapper);

        // 执行用户自定义的refresh事件
        this._execEvent('refresh');

        // 重置滑块的位置
        this.resetPosition();
    }

    /**
     * 重置滑块位置
     * */
    resetPosition(time = 0) {
        let x = this.x;
        let y = this.y;

        if ( !this.hasHorizontalScroll || this.x > 0 ) {
            x = 0;
        } else if ( this.x < this.maxScrollX ) {
            x = this.maxScrollX;
        }

        if ( !this.hasVerticalScroll || this.y > 0 ) {
            y = 0;
        } else if ( this.y < this.maxScrollY ) {
            y = this.maxScrollY;
        }

        if ( x == this.x && y == this.y ) {
            return false;
        }

        this.scrollTo(x, y, time, this.options.bounceEasing);

        return true;
    }

    /**
     * 滚动到(x,y)坐标位置
     * */
    scrollTo(x, y, time = 0, easing = utils.ease.circular) {
        // 判断IScroll对象的状态是不是处于Transition状态
        this.isInTransition = this.options.useTransition && time > 0;
        let transitionType = this.options.useTransition && easing.style;
        // 如果time没有传入，那么直接调用_translate函数改变位置
        // 如果传入了时间，并且有执行transition用的_transitionTimingFunction，则执行transition动画，否则执行_animate函数
        // 实质上是用requestAnimationFrame执行动画
        if ( !time || transitionType ) {
            if(transitionType) {
                this._transitionTimingFunction(easing.style);
                this._transitionTime(time);
            }
            this._translate(x, y);
        } else {
            this._animate(x, y, time, easing.fn);
        }
    }

    /**
     * 以(x, y)的值为增量进行滚动
     * */
    scrollBy(x, y, time, easing) {
        x = this.x + x;
        y = this.y + y;

        this.scrollTo(x, y, time, easing);
    }

    /**
     * 以元素为基准进行位移
     * */
    scrollToElement(el, time, offsetX, offsetY, easing) {
        el = el.nodeType ? el : this.scroller.querySelector(el);

        if ( !el ) return;

        // 相对于最外层的偏移
        var pos = utils.offset(el);

        pos.left -= this.wrapperOffset.left;
        pos.top  -= this.wrapperOffset.top;

        if ( offsetX === true ) {
            offsetX = Math.round(el.offsetWidth / 2 - this.wrapper.offsetWidth / 2);
        }
        if ( offsetY === true ) {
            offsetY = Math.round(el.offsetHeight / 2 - this.wrapper.offsetHeight / 2);
        }

        pos.left -= offsetX || 0;
        pos.top  -= offsetY || 0;

        pos.left = pos.left > 0 ? 0 : pos.left < this.maxScrollX ? this.maxScrollX : pos.left;
        pos.top  = pos.top  > 0 ? 0 : pos.top  < this.maxScrollY ? this.maxScrollY : pos.top;

        time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(this.x-pos.left), Math.abs(this.y-pos.top)) : time;

        this.scrollTo(pos.left, pos.top, time, easing);
    }

    // 取得计算样式
    getComputedPosition() {
        /**
         * matrix(1, 0, 0, 1, 10, -200)
         *
         * 1    0    10       x       x+10       -> 10
         * 0    1    -200     y       y-200      -> -200
         * 0    0    1        1       1          -> 1
         *
         * matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, -200, 10, 1)
         * 1    0    0    10       x       x+10       -> 10
         * 0    1    0    -200     y       y-200      -> -200
         * 0    0    1    10       z       z+10       -> 10
         * 0    0    0    1        1       1          -> 1
         * */
        var matrix = window.getComputedStyle(this.scroller, null),
            x, y;

        if ( this.options.useTransform ) {
            matrix = matrix[utils.style.transform].split(')')[0].split(', ');
            x = +(matrix[12] || matrix[4]);
            y = +(matrix[13] || matrix[5]);
        } else {
            x = +matrix.left.replace(/[^-\d.]/g, '');
            y = +matrix.top.replace(/[^-\d.]/g, '');
        }

        return { x: x, y: y };
    }

    // addEventListener() 方法是将指定的事件监听器注册到目标对象上，当该对象触发指定的事件时，指定的回调函数就会被执行。
    // 第二个参数除传入的是函数外，还可以传入对象，但是该对象中必须有 handleEvent函数，函数中的this指向该对象
    // 可以动态切换绑定事件的处理函数，而不需要remove之前的事件。
    handleEvent(e) {
        switch ( e.type ) {
            case 'touchstart':
                this._start(e);
                break;
            case 'touchmove':
                this._move(e);
                break;
            case 'touchend':
            case 'touchcancel':
                this._end(e);
                break;
            case 'transitionend':
            case 'webkitTransitionEnd':
            case 'oTransitionEnd':
            case 'MSTransitionEnd':
                this._transitionEnd(e);
                break;
            case 'click':
                if ( this.enabled && !e._constructed ) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                break;
        }
    }
}