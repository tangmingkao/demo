/*
 * @Author: tonyTang 
 * @Date: 2018-11-26 09:57:54 
 * @Last Modified by: tonyTang
 * @Last Modified time: 2018-11-27 09:43:07
 */

export default class Utils {
    constructor(){};

    /*
    * 频率控制 返回函数连续调用时，fn 执行频率限定为每多少时间执行一次,详情参考underscore.js的_.throttle函数。
    * @param func {function}  需要调用的函数
    * @param wait  {number}    延迟时间，单位毫秒
    * @param options  {obj} 传参 ，如果你想禁用第一次首先执行的话，传递{leading: false}，还有如果你想禁用最后一次执行的话，传递{trailing: false}。
    * @return {function}实际调用函数
    * 
    * 例子： 
    * var throttled = _.throttle(updatePosition, 100,{leading: false});
    * $(window).scroll(throttled);
    */
    _throttle (func, wait, options) {
        var timeout, context, args, result;
        var previous = 0;
        if (!options) options = {};

        var _now = Date.now || function() {
            return new Date().getTime();
        };

        var later = function() {
            previous = options.leading === false ? 0 : _now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        };

        var throttled = function() {
            var now = _now();
            if (!previous && options.leading === false) previous = now;
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };

        throttled.cancel = function() {
            clearTimeout(timeout);
            previous = 0;
            timeout = context = args = null;
        };
        return throttled;     
    }
  
    /*
    * 频率控制 返回函数连续调用时，fn 执行频率限定为每多少时间执行一次,详情参考underscore.js的_.throttle函数。
    * @param func {function}  需要调用的函数
    * @param wait  {number}    延迟时间，单位毫秒
    * @param immediate  {bool} 传参 immediate 为 true， debounce会在 wait 时间间隔的开始调用这个函数 。
    * @return {function}实际调用函数
    * 
    * 例子：
    * var lazyLayout = _.debounce(calculateLayout, 300);     
    * $(window).resize(lazyLayout);
    */
    _debounce(func, wait, immediate) {
        var timeout, result;
        var later = function(context, args) {
            timeout = null;
            if (args) result = func.apply(context, args);
        };

        var restArguments = function(func, startIndex) {
            startIndex = startIndex == null ? func.length - 1 : +startIndex;
            return function() {
                var length = Math.max(arguments.length - startIndex, 0),
                rest = Array(length),
                index = 0;
                for (; index < length; index++) {
                    rest[index] = arguments[index + startIndex];
                }
                switch (startIndex) {
                    case 0: return func.call(this, rest);
                    case 1: return func.call(this, arguments[0], rest);
                    case 2: return func.call(this, arguments[0], arguments[1], rest);
                }
                var args = Array(startIndex + 1);
                for (index = 0; index < startIndex; index++) {
                    args[index] = arguments[index];
                }
                args[startIndex] = rest;
                return func.apply(this, args);
            };
        };

        var _delay =  restArguments(function(func, wait, args) {
            return setTimeout(function() {
                return func.apply(null, args);
            }, wait);
        });

        var debounced = restArguments(function(args) {
            if (timeout) clearTimeout(timeout);
            if (immediate) {
                var callNow = !timeout;
                timeout = setTimeout(later, wait);
                if (callNow) result = func.apply(this, args);
            } else {
                timeout = _delay(later, wait, this, args);
            }
            return result;
        });
        
        debounced.cancel = function() {
            clearTimeout(timeout);
            timeout = null;
        };

        return debounced;
    }
    /*
    * 简单的克隆函数
    * @param origin {object}  克隆的对象
    * 
    */
    clone(origin){
        let originProto = Object.getPrototypeOf(origin);
        return Object.assign(Object.create(originProto),origin);
    }
    /*
    * 校验是否输入emoji表情
    * @param str {string}  校验的字符串
    * 校验是否输入表情的简单方法。true为输入了.
    */
    checkEmoji(str){
        let regemoji = /\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]/g;
        return str.match(regemoji) != null;
    }
    /*
    * 仿jq的trim方法
    * @param text {string}  处理的字符串
    */
    jq_trim(text){
        let rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        return text == null ? "" : (text + '').replace(rtrim,"");
    }
    /*
    * 简单的判断是否是空对象
    * @param obj {object}  处理的字符串
    */
    is_empty(obj){
        return JSON.stringify(obj) == '{}';
    }
}