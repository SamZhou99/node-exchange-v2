const system_crpto = require('../lib/system.crypto.js')

// 验证请求
const RequestAuth = {
    Check(request, reply) {
        const token = request.headers.token
        if (!token) {
            console.log('token--------------------------------------------------------------', token)
            return 1
        }
        const aseDec = system_crpto.decryption(token)
        const json = JSON.parse(aseDec)
        // 检查时间
        const ts = Math.floor(new Date().getTime() / 1000)
        if (json.login_ts + (60 * 60 * 24) < ts) {
            console.log('ts--------------------------------------------------------------', json.login_ts, ts, json.login_ts + (60 * 60 * 24) < ts)
            return 2
        }
        // 检查IP
        const ip = request.headers['cf-connecting-ip'] || request.headers['x-real-ip'] || request.ip
        if (json.login_ip != ip) {
            console.log('ip--------------------------------------------------------------', json.login_ip, ip)
            return 3
        }
        // 检查设备
        const user_agent = request.headers['user-agent']
        if (json.login_ua != user_agent) {
            console.log('user_agent--------------------------------------------------------------', json.login_ua, user_agent)
            return 4
        }
        // 检查ID
        const user_id = request.query.user_id || request.body.user_id
        if (json.id != user_id) {
            console.log('user_id--------------------------------------------------------------', json.id, user_id)
            return 5
        }
        return -1
    },
    ResultJson(i) {
        return {
            code: 110,
            flag: 'Request exception ' + i
        }
    },
    ResultStr(i) {
        return 'Request exception ' + i
    },
}


module.exports = RequestAuth