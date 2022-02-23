const utils99 = require('node-utils99')
const { db } = require('../../lib/db.setup.js')

let _t = {
    // 创建会员
    async createMember(agent_id, account, password, notes, type, status, ip) {
        const create_datetime = utils99.Time()
        const update_datetime = utils99.Time()
        const res = await db.Query("INSERT INTO member_list (agent_id, account, password, notes, type, status, ip, create_datetime, update_datetime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [agent_id, account, password, notes, type, status, ip, create_datetime, update_datetime])
        return res
    },
    // 通过账号 查询一条记录
    async oneByAccount(account) {
        const res = await db.Query("SELECT * FROM member_list WHERE account=? LIMIT 1", [account])
        if (res.length > 0) {
            let member = res[0]
            delete member.password
            return member
        }
        return null
    },
    // 通过账号密码 查询一条记录
    async oneByAccountPassword(account, password) {
        const res = await db.Query("SELECT * FROM member_list WHERE account=? AND password=? LIMIT 1", [account, password])
        if (res.length > 0) {
            let member = res[0]
            delete member.password
            delete member.notes
            return member
        }
        return null
    },
    // 会员列表
    async list(start, length) {
        const total = await db.Query("SELECT COUNT(0) AS total FROM member_list")[0]['total']
        let list = await db.Query("SELECT * FROM member_list LIMIT ?,?", [start, length])
        list.formEach(function (item) {
            delete item.password
        })
        return { total, list }
    }
}

module.exports = _t