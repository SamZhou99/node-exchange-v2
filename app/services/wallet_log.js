const utils99 = require('node-utils99')
const config = require('../../config/all.js')
const { db } = require('../../lib/db.setup.js')

let _t = {

    async oneByHash(hash) {
        const res = await db.Query("SELECT * FROM member_wallet_log WHERE hash=? LIMIT 1", [hash])
        return res.length > 0 ? res[0] : null
    },

    async list(target_user_id, start, length, real_status) {
        let total, list
        if (target_user_id) {
            total = await db.Query("SELECT COUNT(0) AS total FROM member_wallet_log WHERE user_id=?", [target_user_id])
            total = total[0]['total']
            list = await db.Query("SELECT * FROM member_wallet_log WHERE user_id=? ORDER BY id DESC LIMIT ?,?", [target_user_id, start, length])
        } else if (real_status) {
            total = await db.Query("SELECT COUNT(0) AS total FROM member_wallet_log WHERE `hash`!=''", [])
            total = total[0]['total']
            list = await db.Query("SELECT * FROM member_wallet_log WHERE `hash`!='' ORDER BY id DESC LIMIT ?,?", [start, length])
        } else {
            total = await db.Query("SELECT COUNT(0) AS total FROM member_wallet_log", [])
            total = total[0]['total']
            list = await db.Query("SELECT * FROM member_wallet_log ORDER BY id DESC LIMIT ?,?", [start, length])
        }
        return { total, list }
    },
    async listByAgentId(agent_id, target_user_id, start, length) {
        let total, list
        if (target_user_id) {
            total = await db.Query("SELECT COUNT(0) AS total FROM member_wallet_log WHERE user_id=?", [target_user_id])
            total = total[0]['total']
            list = await db.Query("SELECT * FROM member_wallet_log WHERE user_id=? ORDER BY id DESC LIMIT ?,?", [target_user_id, start, length])
        } else {
            total = await db.Query("SELECT COUNT(0) AS total FROM member_wallet_log WHERE user_id IN (SELECT id FROM member_list WHERE agent_id=?)", [agent_id])
            total = total[0]['total']
            list = await db.Query("SELECT * FROM member_wallet_log WHERE user_id IN (SELECT id FROM member_list WHERE agent_id=?) ORDER BY id DESC LIMIT ?,?", [agent_id, start, length])
        }
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
        const sum = await db.Query("SELECT SUM(amount) AS sum FROM member_wallet_log WHERE user_id=? AND wallet_type=? AND `hash`<>'' ", [user_id, coin_name])
        return sum.length <= 0 ? null : sum[0]['sum']
    },

    async listDashboard(len) {
        const res = await db.Query("SELECT * FROM member_wallet_log WHERE `hash`<>'' ORDER BY time DESC LIMIT ?", [len])
        return res
    },

    async listDashboardByAgentId(agent_id, len) {
        const res = await db.Query("SELECT * FROM member_wallet_log WHERE `hash`<>'' AND user_id IN (SELECT id FROM member_list WHERE agent_id=?) ORDER BY time DESC LIMIT ?", [agent_id, len])
        return res
    },

    // 某段时间 注册人数
    async listByDateBetween(coinType, startDate, endDate) {
        let list = await db.Query("SELECT * FROM member_wallet_log WHERE wallet_type=? AND `hash`<>'' AND time BETWEEN ? AND ? ORDER BY time DESC", [coinType, startDate, endDate])
        return list
    },
    async listByDateBetweenByAgentId(agent_id, coinType, startDate, endDate) {
        let list = await db.Query("SELECT * FROM member_wallet_log WHERE wallet_type=? AND `hash`<>'' AND time BETWEEN ? AND ? AND user_id IN (SELECT id FROM member_list WHERE agent_id=?) ORDER BY time DESC", [coinType, startDate, endDate, agent_id])
        return list
    },

    // 添加日志
    async addLog(user_id, operator_id, action, amount, hash, to_address, wallet_type, notes, time) {
        const create_datetime = utils99.Time(config.web.timezone)
        const update_datetime = utils99.Time(config.web.timezone)
        const res = await db.Query("INSERT INTO member_wallet_log(user_id, operator_id, action, amount, hash, to_address, wallet_type, notes, time, create_datetime, update_datetime) VALUES(?,?,?,?,?,?,?,?,?,?,?)", [user_id, operator_id, action, amount, hash, to_address, wallet_type, notes, time, create_datetime, update_datetime])
        return res
    },

    // 更新结算状态
    async updateFinish(id, finish) {
        const update_datetime = utils99.Time(config.web.timezone)
        const res = await db.Query("UPDATE member_wallet_log SET `finish`=?, `update_datetime`=?  WHERE `id`=?", [finish, update_datetime, id])
        return res
    },


}
module.exports = _t