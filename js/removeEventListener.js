
/*
* @ 很多时候会遇到 removeEventListener 无法清除监听的情况
* @ 原因： 要移除事件句柄，addEventListener() 的执行函数必须使用外部函数，如上实例所示 (myFunction)。
* @ 匿名函数，类似 “document.removeEventListener(“event”, function(){ myScript });” 该事件是无法移除的。
* @ https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/removeEventListener
* @ 
*/

function isFn(value){
    const type = Object.prototype.toString.call(value);
    return type === '[object Function]';
}

function isNode(value){
    return value !== undefined && value instanceof HTMLElement && value.nodeType === 1;
}

function listenNode(node,type,callback){
    node.addEventListener(type, callback);
    return {
        destroy() {
            node.removeEventListener(type, callback);
        },
    };
}

function addListener(target, type, callback) {
    if (!target && !type && !callback) {
        throw new Error('missing parameters');
    }
    if (!isFn(callback)) {
        throw new TypeError('Third argument must be a Function');
    }
    if (isNode(target)) {
        return listenNode(target, type, callback);
    }
    throw new TypeError('First argument must be a String, HTMLElement, HTMLCollection, or NodeList');
}

function listenNodeList(nodeList, type, callback) {
    Array.prototype.forEach.call(nodeList, node => {
        node.addEventListener(type, callback);
    });
  
    return {
        destroy() {
            Array.prototype.forEach.call(nodeList, node => {
                node.removeEventListener(type, callback);
            });
        },
    };
}

module.exports = listener;