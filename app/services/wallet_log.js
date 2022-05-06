const utils99 = require('node-utils99')
const { db } = require('../../lib/db.setup.js')

let _t = {
    async list(start, length) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM member_wallet_log", [])
        total = total[0]['total']
        const list = await db.Query("SELECT * FROM member_wallet_log ORDER BY id DESC LIMIT ?,?", [start, length])
        return { total, list }
    },

    async listByUserId(user_id, start, length) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM member_wallet_log WHERE user_id=?", [user_id])
        total = total[0]['total']
        const list = await db.Query("SELECT * FROM member_wallet_log WHERE user_id=? ORDER BY id DESC LIMIT ?,?", [user_id, start, length])
        return { total, list }
    },

    async addLog(user_id, operator_id, action, amount, hash, to_address, wallet_type, notes, time) {
        const create_datetime = utils99.Time()
        const update_datetime = utils99.Time()
        const res = await db.Query("INSERT INTO member_wallet_log(user_id, operator_id, action, amount, hash, to_address, wallet_type, notes, time, create_datetime, update_datetime) VALUES(?,?,?,?,?,?,?,?,?,?,?)", [user_id, operator_id, action, amount, hash, to_address, wallet_type, notes, time, create_datetime, update_datetime])
        return res
    },

    async listDashboard() {
        const res = await db.Query("SELECT * FROM member_wallet_log WHERE `hash`<>'' ORDER BY time DESC LIMIT 5", [])
        return res
    },
}
module.exports = _t