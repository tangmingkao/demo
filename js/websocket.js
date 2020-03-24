/*
 * HooWebSocket
 * @Date: 2019-10-29 19:35:23 
 * @Last Modified time: 2019-10-29 19:35:23 
 */

import socketLoginData from './socketLoginData';
class selfWebSocket {
    constructor(url = 'ws://tangmingkao.com/ws', options) {
        this.heartBeatTimer = null;
        this.options = options;
        this.messageMap = {};
        this.subscribeMap = [];
        this.connState = 0;
        this.repeatCount = 0;
        this.repeatTimer = null;
        this.socket = null;
        this.url = url;
        this.init();
    }
    async init() {
        if (this.socket) {
            this.socket.onopen = this.socket.onclose = this.socket.onmessage = this.socket.onerror = null;
            window.clearInterval(this.heartBeatTimer);
            this.heartBeatTimer = null;
            window.clearTimeout(this.repeatTimer);
            this.repeatTimer = null;
            // this.doClose();
        }
        if (this.connState) return;
        this.connState = 1;
        this.afterOpenEmit = [];
        //生成websocket对象
        const BrowserWebSocket = window.WebSocket || window.MozWebSocket;
        const socket = new BrowserWebSocket(this.url);
        //socket属性
        socket.binaryType = 'arraybuffer';
        socket.onopen = event => this.onOpen(event);
        socket.onclose = event => this.onClose(event);
        socket.onmessage = event => this.onMessage(event.data);
        socket.onerror = err => this.onError(err);
        this.socket = socket;
    }
    loginSocket() {
        let loginPromise = new Promise((resolve, reject) => {
            const loginDataObj = new socketLoginData();
            let loginData = loginDataObj.LoginData;
            this.sendMessage(loginData);
            this.on('loginws', () => {
                resolve(true);
            });
        });
        return loginPromise;
    }
    checkOpen() {
        return this.connState === 2;
    }
    async onOpen(event) {
        let that = this;
        // console.log(event);
        this.connState = 2;
        //初始化后先登陆，确保登陆成功
        await this.loginSocket();
        this.onReceiver({
            Event: 'open'
        });
        //做下延时处理，尽量确保登陆后再做其他处理
        setTimeout(() => {
            if (that.repeatCount >= 1) {
                //重新连接登陆后再做心跳检测
                that.heartBeatTimer = setInterval(that.checkHeartbeat.bind(that), 35000);
                //如果是重连则需要连接断开连接之前的连接
                that.subscribeMap.forEach((item) => {
                    that.sendMessage(item);
                });
            } else {
                //首次登陆后再做心跳检测
                that.heartBeatTimer = setInterval(that.checkHeartbeat.bind(that), 35000);
            }
        }, 500);

    }
    onClose(event) {
        // console.log(event);
        this.connState = 0;
        if (this.connState) {
            this.onReceiver({
                Event: 'close'
            });
        }
        //重新连接
        this.reConnect();
    }
    reConnect() {
        // console.log(this.subscribeMap);
        let that = this;
        //停止心跳检测
        if (this.heartBeatTimer) {
            window.clearInterval(this.heartBeatTimer);
            this.heartBeatTimer = null;
        }
        let tempNum = this.repeatCount;
        let setTimeLimit = 0;
        if (tempNum == 0) {
            setTimeLimit = 0;
        } else {
            if (tempNum > 6) {
                setTimeLimit = Math.pow(2, 6) * 1000;
            } else {
                setTimeLimit = Math.pow(2, tempNum) * 1000;
            }
        }
        this.repeatTimer = setTimeout(() => {
            //指数递推时间重连
            that.init();
        }, setTimeLimit);
        //立即更新
        that.repeatCount++;
    }
    onMessage(message) {
        try {
            const data = typeof message == 'string' ? JSON.parse(message) : message;
            //登陆回调单独处理
            let tempStr = data && data.op;
            if (tempStr == 'loginws') {
                //登陆回调
                let loginCallBack = this.messageMap['loginws'];
                if (loginCallBack) {
                    loginCallBack(data);
                }
            } else if (tempStr == 'req') {
                //请求列表回调
                let callbackName = data && data.method;
                let callback = this.messageMap[callbackName];
                if (callback) {
                    callback(data);
                }
            } else {
                //别的sub回调
                let callbackName = data && data.topic;
                let callback = this.messageMap[callbackName];
                if (callback) {
                    callback(data);
                }
            }
            this.onReceiver({
                Event: 'message',
                Data: data
            });
        } catch (err) {
            console.error(' >> Data parsing error:', err);
        }
    }
    onError(err) {
        console.log(err);
        //重新连接
        this.reConnect();
    }

    onReceiver(data) {
        // console.log(data);
        const callback = this.messageMap[data.Event];
        if (callback) callback(data.Data);
    }
    checkHeartbeat() {
        let data = {
            'op': 'sub',
            'topic': 'hb'
        };
        this.sendMessage(data);
    }
    doClose() {
        if (this.heartBeatTimer) {
            window.clearInterval(this.heartBeatTimer);
            this.heartBeatTimer = null;
        }
        this.socket.close();
        this.messageMap = {};
        this.connState = 0;
        this.socket = null;
    }
    sendMessage(data) {
        if (this.checkOpen()) {
            this.socket.send(JSON.stringify(data));
        } else {
            this.on('open', () => {
                this.socket.send(JSON.stringify(data));
            });
        }
    }
    subscribe(data, callbackName, callback) {
        this.joinSubscribeMap(data);
        this.sendMessage(data);
        this.on(callbackName, callback);
    }
    unsubscribe(data) {
        this.deleteSubscribeMap(data);
        this.sendMessage(data);
    }
    joinSubscribeMap(data) {
        let subType = data && data.op || '';
        let tempMethod = data && data.method;
        let tempTopic = data && data.topic || '';
        let callBackFun = subType == 'req' ? tempMethod : tempTopic;
        let hasTopic = false;
        this.subscribeMap.forEach((item) => {
            let itemTopic = item && item.topic || '';
            let itemMethod = item && item.method || '';
            let itemSubType = item && item.op || '';
            let itemCallBackFun = itemSubType == 'req' ? itemMethod : itemTopic;
            if (itemCallBackFun == callBackFun) {
                hasTopic = true;
            }
        });
        if (!hasTopic) {
            this.subscribeMap.push(data);
        }
    }
    deleteSubscribeMap(data) {
        let tempTopic = data && data.topic || '';
        let subType = data && data.op || '';
        let tempMethod = data && data.method;
        let callBackFun = subType == 'req' ? tempMethod : tempTopic;
        this.subscribeMap.forEach((item, index) => {
            let itemTopic = item && item.topic || '';
            let itemMethod = item && item.method || '';
            let itemSubType = item && item.op || '';
            let itemCallBackFun = itemSubType == 'req' ? itemMethod : itemTopic;
            if (itemCallBackFun == callBackFun) {
                this.subscribeMap.splice(index, 1);
            }
        });
    }
    on(name, handler) {
        this.messageMap[name] = handler;
    }
}

export default selfWebSocket;