class socketLoginData {
    constructor() {
        this.LoginData = null;
        this.init();
    }
    init() {
        let token = JSON.parse(localStorage.getItem('token')) || "";
        let nonce = "";
        if (token) {
            //登陆
            nonce = token;
        } else {
            //未登录
            nonce = 'suijizifuchuang';
        }
        let timestamp = Date.parse(new Date()) / 1000;
        let tempLoginData = {
            nonce: nonce,
            ts: timestamp,
        };
        this.LoginData = tempLoginData;
    }
}

export default socketLoginData;