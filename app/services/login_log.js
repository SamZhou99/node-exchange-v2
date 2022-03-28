const utils99 = require('node-utils99')
const { db } = require('../../lib/db.setup.js')

let _t = {
    // 常量
    UserType: {
        ADMIN: 'admin',
        AGENT: 'agent',
        MEMBER: 'member',
    },
    // 添加 登录日志
    async addLoginLog(user_id, user_type, user_agent, ip) {
        const create_datetime = utils99.Time()
        const update_datetime = utils99.Time()
        const res = await db.Query("INSERT INTO login_log (user_id, user_type, user_agent, ip, create_datetime, update_datetime) VALUES (?, ?, ?, ?, ?, ?)", [user_id, user_type, user_agent, ip, create_datetime, update_datetime])
        return res
    },
    // 登录日志列表
    async list(user_id, user_type, start, length) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM login_log WHERE user_id=? AND user_type=?", [user_id, user_type])
        total = total[0]['total']
        let list = await db.Query("SELECT * FROM login_log WHERE user_id=? AND user_type=? ORDER BY id DESC LIMIT ?,?", [user_id, user_type, start, length])
        return { total, list }
    }
}

module.exports = _t