/*
 * @Author: tonyTang 
 * @Date: 2018-11-27 09:34:23 
 * @Last Modified by:   tonyTang 
 * @Last Modified time: 2018-11-27 09:34:23 
 */

// 移动端适配
(function (doc, win) {
    var docEl = doc.documentElement,
        resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
        recalc = function () {
            var clientWidth = docEl.clientWidth
            // alert(clientWidth);
            if (!clientWidth) return
            if (  clientWidth >= 750 && clientWidth < 1024 ) {
                docEl.style.fontSize = '100px'
            } else if( clientWidth >= 1024) {
                docEl.style.fontSize = '120px';      
            }else {
                docEl.style.fontSize = 100 * (clientWidth / 750) + 'px'
            }
        };
    if (!doc.addEventListener) return;
    win.addEventListener(resizeEvt, recalc, false);
    doc.addEventListener('DOMContentLoaded', recalc, false);
})(document, window)