const utils99 = require('node-utils99')
const { db } = require('../../lib/db.setup.js')

let _t = {
    async list(user_id, start, length) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM member_withdraw_log WHERE user_id=? ", [user_id])
        total = total[0]['total']
        const list = await db.Query("SELECT * FROM member_withdraw_log WHERE user_id=? ORDER BY id DESC LIMIT ?,?", [user_id, start, length])
        return { total, list }
    },
    async oneById(user_id) {
        const res = await db.Query("SELECT * FROM member_withdraw_log WHERE user_id=? LIMIT 1", [user_id])
        return res.length > 0 ? res[0] : null
    },
    async ApplyFor(user_id, status, apply_amount, real_amount, charges, type, address) {
        const failed_reason = ""
        const create_datetime = utils99.Time()
        const update_datetime = utils99.Time()
        const res = await db.Query(
            "INSERT INTO member_withdraw_log(user_id, status, apply_amount, real_amount, charges, `type`, address, failed_reason, create_datetime, update_datetime) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [user_id, status, apply_amount, real_amount, charges, type, address, failed_reason, create_datetime, update_datetime])
        return res
    },
}
module.exports = _t