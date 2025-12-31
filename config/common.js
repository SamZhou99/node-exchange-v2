module.exports = {
    coin: {
        need: [
            'btc', 'eth', 'xrp', 'mkr', 'bifi', 'gno', 'qnt', 'ltc'
        ],
        type: {
            BTC: "btc",
            ETH: "eth",
            USDT: "usdt",
        }
    },

    message: {
        "10010": "Email is not verified", // 邮箱未验证
        "10015": "The Email verification code is incorrect", // 邮箱-验证码错误
        "10020": "Invitation code error!", // 邀请码错误
        "10030": "The account already exists, please change another account to register!", // 该帐号已经存在，请更换其他帐号注册!
        "10040": "Verification code error", // 验证码错误
        "10050": "Wrong Email or Password!", // 郵箱或密碼錯誤
        "20010": "Trade successfully!", // 交易成功
        "20020": "Reach buy stop condition, close out position.", // 达到 买入止损，平仓
        "20030": "Reach sell stop condition, close out position.", //达到 买出止损，平仓
        "20040": "System help you, forced close out position.", // 系统帮助您，强制平仓！
    }
}