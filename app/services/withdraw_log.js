const utils99 = require('node-utils99')
const config = require('../../config/all.js')
const { db } = require('../../lib/db.setup.js')

let _t = {
    async list(start, length) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM member_withdraw_log", [])
        total = total[0]['total']
        const list = await db.Query("SELECT * FROM member_withdraw_log ORDER BY id DESC LIMIT ?,?", [start, length])
        return { total, list }
    },
    async listByAgentId(agent_id, start, length) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM member_withdraw_log WHERE user_id IN (SELECT id FROM member_list WHERE agent_id=?)", [agent_id])
        total = total[0]['total']
        const list = await db.Query("SELECT * FROM member_withdraw_log WHERE user_id IN (SELECT id FROM member_list WHERE agent_id=?) ORDER BY id DESC LIMIT ?,?", [agent_id, start, length])
        return { total, list }
    },

    async listByUserId(user_id, start, length) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM member_withdraw_log WHERE user_id=? ", [user_id])
        total = total[0]['total']
        const list = await db.Query("SELECT * FROM member_withdraw_log WHERE user_id=? ORDER BY id DESC LIMIT ?,?", [user_id, start, length])
        return { total, list }
    },

    async oneByUserId(user_id) {
        const res = await db.Query("SELECT * FROM member_withdraw_log WHERE user_id=? LIMIT 1", [user_id])
        return res.length > 0 ? res[0] : null
    },

    async oneById(id) {
        const res = await db.Query("SELECT * FROM member_withdraw_log WHERE id=? LIMIT 1", [id])
        return res.length > 0 ? res[0] : null
    },

    async ApplyFor(user_id, status, apply_amount, real_amount, charges, type, address) {
        const failed_reason = ""
        const create_datetime = utils99.Time(config.web.timezone)
        const update_datetime = utils99.Time(config.web.timezone)
        const res = await db.Query(
            "INSERT INTO member_withdraw_log(user_id, status, apply_amount, real_amount, charges, `type`, address, failed_reason, create_datetime, update_datetime) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [user_id, status, apply_amount, real_amount, charges, type, address, failed_reason, create_datetime, update_datetime])
        return res
    },

    async updateStatusReason(id, status, failed_reason = "") {
        const update_datetime = utils99.Time(config.web.timezone)
        const res = await db.Query("UPDATE `member_withdraw_log` SET `status`=?,`failed_reason`=?,`update_datetime`=? WHERE (`id`=?)", [status, failed_reason, update_datetime, id])
        return res
    },
}
module.exports = _t