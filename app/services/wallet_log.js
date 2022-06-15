const utils99 = require('node-utils99')
const config = require('../../config/all.js')
const { db } = require('../../lib/db.setup.js')

let _t = {

    async oneByHash(hash) {
        const res = await db.Query("SELECT * FROM member_wallet_log WHERE hash=? LIMIT 1", [hash])
        return res.length > 0 ? res[0] : null
    },

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

    async listByUserIdCoinName(user_id, coin_name, start, length) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM member_wallet_log WHERE user_id=? AND wallet_type=?", [user_id, coin_name])
        total = total[0]['total']
        const list = await db.Query("SELECT * FROM member_wallet_log WHERE user_id=? AND wallet_type=? ORDER BY id DESC LIMIT ?,?", [user_id, coin_name, start, length])
        return { total, list }
    },

    async sumByUserIdCoinName(user_id, coin_name) {
        const sum = await db.Query("SELECT SUM(amount) AS sum FROM member_wallet_log WHERE user_id=? AND wallet_type=? AND `hash`<>'' ORDER BY id DESC", [user_id, coin_name])
        return sum[0]['sum']
    },

    async listDashboard() {
        const res = await db.Query("SELECT * FROM member_wallet_log WHERE `hash`<>'' ORDER BY time DESC LIMIT 5", [])
        return res
    },

    async addLog(user_id, operator_id, action, amount, hash, to_address, wallet_type, notes, time) {
        const create_datetime = utils99.Time(config.web.timezone)
        const update_datetime = utils99.Time(config.web.timezone)
        const res = await db.Query("INSERT INTO member_wallet_log(user_id, operator_id, action, amount, hash, to_address, wallet_type, notes, time, create_datetime, update_datetime) VALUES(?,?,?,?,?,?,?,?,?,?,?)", [user_id, operator_id, action, amount, hash, to_address, wallet_type, notes, time, create_datetime, update_datetime])
        return res
    },


}
module.exports = _t