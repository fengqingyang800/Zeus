/**
 * @file utils.js
 * @author lee
 * @desc 工具函数
 * */

/**
 * 针对不同内核的浏览器对requestAnimationFrane做兼容处理
 * */
const requestAnimationFrame = window.requestAnimationFrame            ||
                              window.webkitRequestAnimationFrame      ||
                              window.mozRequestAnimationFrame         ||
                              window.oRequestAnimationFrame           ||
                              window.msRequestAnimationFrame          ||
                              function(cb) { window.setTimeout(cb, 1000/60); };

/**
 * 缓存DIV元素的默认样式，为之后的兼容处理做准备
 * */
const _elementStyle = document.createElement('div').style;

/**
 * 获取厂商前缀
 * */
const _vendor = (() => {
    const vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'];
    const len = vendors.length;

    let transform, i = 0;

    for(; i < len; i++){
        transform = vendors[i] + 'ransform';

        if(transform in _elementStyle) {
            return vendors[i].substr(0, vendors[i].length -1);
        }
    }

    return false;
})();

/**
 * 判断是否为坏的安卓手机
 * */
const isBadAndroid = (() => {
    var appVersion = window.navigator.appVersion;

    if (/Android/.test(appVersion) && !(/Chrome\/\d/.test(appVersion))) {
        var safariVersion = appVersion.match(/Safari\/(\d+.\d)/);
        if(safariVersion && typeof safariVersion === "object" && safariVersion.length >= 2) {
            return parseFloat(safariVersion[1]) < 535.19;
        } else {
            return true;
        }
    } else {
        return false;
    }
})();

const _transform = _prefixStyle('transform');

/**
 * 对transition、translate等属性做兼容处理
 * */
function _prefixStyle(style) {
    if(_vendor === false) return false;
    if(_vendor === '') return style;
    return _vendor+ style.charAt(0).toUpperCase() + style.substr(1);
}

/**
 * 简单的属性拷贝函数
 * */
function extend(target, obj) {
    for(let i in obj) {
        target[i] = obj[i];
    }
}

/**
 * 绑定事件的函数
 *
 * @param
 *      el - DOM元素
 *      type - 事件类型
 *      fn - 事件处理器
 *      capture - 捕获开关
 */
function addEvent(el, type, fn, capture) {
    el.addEventListener(type, fn, !!capture);
}

/**
 * 删除事件的函数
 *
 * @param
 *      el - DOM元素
 *      type - 事件类型
 *      fn - 事件处理器
 *      capture - 捕获开关
 * */
function removeEvent(el, type, fn, capture) {
    el.removeEventListener(type, fn, !!capture);
}

/**
 * 动量函数
 *
 * @param
 *      current - 当前位置
 *      start -  起始位置
 *      time - 持续事件
 *      lowerMargin - 滑块长度
 *      wrapperSize - 容器长度
 *      deceleration - 阻尼系数
 *
 * @return
 *      destination - 终点位置
 *      duration - 持续时间
 * */
function momentum(current, start, time, lowerMargin, wrapperSize, deceleration) {
    var distance = current - start,
        speed = Math.abs(distance) / time,
        destination,
        duration;

    deceleration = deceleration === undefined ? 0.0006 : deceleration;

    destination = current + ( speed * speed ) / ( 2 * deceleration ) * ( distance < 0 ? -1 : 1 );
    duration = speed / deceleration;

    if ( destination < lowerMargin ) {
        destination = wrapperSize ? lowerMargin - ( wrapperSize / 2.5 * ( speed / 8 ) ) : lowerMargin;
        distance = Math.abs(destination - current);
        duration = distance / speed;
    } else if ( destination > 0 ) {
        destination = wrapperSize ? wrapperSize / 2.5 * ( speed / 8 ) : 0;
        distance = Math.abs(current) + destination;
        duration = distance / speed;
    }

    return {
        destination: Math.round(destination),
        duration: duration
    };
}

/**
 * 计算偏移
 * */
function offset(el) {
    let left = -el.offsetLeft;
    let top = -el.offsetTop;

    while(el = el.offsetParent) {
        left -= el.offsetLeft;
        top -= el.offsetTop;
    }

    return {left, top}
}

function preventDefaultException(el, exceptions){
    for ( var i in exceptions ) {
        if ( exceptions[i].test(el[i]) ) {
            return true;
        }
    }

    return false;
}

/**
 * 自定义的tap事件
 */
function tap(e, eventName) {
    var ev = document.createEvent('Event');
    ev.initEvent(eventName, true, true);
    ev.pageX = e.pageX;
    ev.pageY = e.pageY;
    e.target.dispatchEvent(ev);
}

/**
 * 自定义click事件
 * */
function click(e) {
    var target = e.target,
        ev;

    if ( !(/(SELECT|INPUT|TEXTAREA)/i).test(target.tagName) ) {
        ev = document.createEvent(window.MouseEvent ? 'MouseEvents' : 'Event');
        ev.initEvent('click', true, true);
        ev.view = e.view || window;
        ev.detail = 1;
        ev.screenX = target.screenX || 0;
        ev.screenY = target.screenY || 0;
        ev.clientX = target.clientX || 0;
        ev.clientY = target.clientY || 0;
        ev.ctrlKey = !!e.ctrlKey;
        ev.altKey = !!e.altKey;
        ev.shiftKey = !!e.shiftKey;
        ev.metaKey = !!e.metaKey;
        ev.button = 0;
        ev.relatedTarget = null;
        ev._constructed = true;
        target.dispatchEvent(ev);
    }
};

return me;
}

const style = {
    transform: _transform,
    transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
    transitionDuration: _prefixStyle('transitionDuration'),
    transitionDelay: _prefixStyle('transitionDelay'),
    transformOrigin: _prefixStyle('transformOrigin')
};

const eventType = {
    touchstart: 1,
    touchmove: 1,
    touchend: 1
};

/**
 * 动画
 * */
const ease = {
    quadratic: {
        style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fn: function (k) {
            return k * ( 2 - k );
        }
    },
    circular: {
        style: 'cubic-bezier(0.1, 0.57, 0.1, 1)',	// Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
        fn: function (k) {
            return Math.sqrt( 1 - ( --k * k ) );
        }
    },
    back: {
        style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        fn: function (k) {
            var b = 4;
            return ( k = k - 1 ) * k * ( ( b + 1 ) * k + b ) + 1;
        }
    },
    bounce: {
        style: '',
        fn: function (k) {
            if ( ( k /= 1 ) < ( 1 / 2.75 ) ) {
                return 7.5625 * k * k;
            } else if ( k < ( 2 / 2.75 ) ) {
                return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
            } else if ( k < ( 2.5 / 2.75 ) ) {
                return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
            } else {
                return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
            }
        }
    },
    elastic: {
        style: '',
        fn: function (k) {
            var f = 0.22,
                e = 0.4;

            if ( k === 0 ) { return 0; }
            if ( k == 1 ) { return 1; }

            return ( e * Math.pow( 2, - 10 * k ) * Math.sin( ( k - f / 4 ) * ( 2 * Math.PI ) / f ) + 1 );
        }
    }
}

const utils = {
    hasTransform: _transform !== false,
    hasPerspective: _prefixStyle('perspective') in _elementStyle,
    hasTouch: 'ontouchstart' in window,
    hasTransition: _prefixStyle('transition') in _elementStyle,
    prefixStyle: _prefixStyle,
    style,
    isBadAndroid,
    offset,
    preventDefaultException,
    eventType,
    ease,
    tap,
    click,
    requestAnimationFrame
}

export default utils;