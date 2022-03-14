const utils99 = require('node-utils99')
const { db } = require('../../lib/db.setup.js')

let _t = {
    async addLog(user_id, coin_name, amount, balance, action) {
        const create_datetime = utils99.Time()
        const update_datetime = utils99.Time()
        const res = await db.Query("INSERT INTO member_transfer_log (user_id,coin_name,amount,balance,action,create_datetime,update_datetime) VALUES(?,?,?,?,?,?,?)",
            [user_id, coin_name, amount, balance, action, create_datetime, update_datetime])
        return res
    },
    async list(user_id, start, length) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM member_transfer_log WHERE user_id=?", [user_id])
        total = total[0]['total']
        const list = await db.Query("SELECT * FROM member_transfer_log WHERE user_id=? ORDER BY id DESC LIMIT ?,?", [user_id, start, length])
        return { total, list }
    },
}
module.exports = _t