let _t = {
    TOKEN_NOT_FOUND: { code: 1010, explain: "找不到token" },
    TOKEN_DECRYPTION_ERROR: { code: 1020, explain: "token解密出错" },
    TOKEN_STATUS_ERROR: { code: 1030, explain: "json解码后，状态不对" },
    TOKEN_AUTH_TIMEOUT: { code: 1040, explain: "token认证超时" },

    REQUEST_TOKEN_NOT_FOUND: { code: 2010, explain: "请求token找不到" },
    REQUEST_TOKEN_TIMEOUT: { code: 2020, explain: "请求token超时" },
    REQUEST_TOKEN_IP_ERROR: { code: 2030, explain: "请求IP与登录IP不符" },
    REQUEST_TOKEN_UA_ERROR: { code: 2040, explain: "请求设备与登录设备不符" },
    REQUEST_TOKEN_USERID_ERROR: { code: 2050, explain: "请求用户ID与登录用户ID不符" },
}
module.exports = _t