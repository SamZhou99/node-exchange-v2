const utils99 = require('node-utils99')
const config = require('../../config/all.js');
const { db } = require('../../lib/db.setup.js')

let _t = {
    // // 登录日志列表
    // async list(start, length) {
    //     let total = await db.Query("SELECT COUNT(0) AS total FROM currency_platform")
    //     total = total[0]['total']
    //     let list = await db.Query("SELECT * FROM currency_platform ORDER BY id DESC LIMIT ?,?", [start, length])
    //     return { total, list }
    // }

    // 查询-交易记录 通过userId,coinType
    async listByUserIdCoinType(user_id, coin_type, start, length) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM currency_platform_trade_log WHERE user_id=? AND platform_coin_type=?", [user_id, coin_type])
        total = total[0]['total']
        const list = await db.Query("SELECT * FROM currency_platform_trade_log WHERE user_id=? AND platform_coin_type=? ORDER BY id DESC LIMIT ?,?", [user_id, coin_type, start, length])
        return { total, list }
    },

    // 查询-交易记录 通过userId
    async listByUserId(user_id, start, length) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM currency_platform_trade_log WHERE user_id=?", [user_id])
        total = total[0]['total']
        const list = await db.Query("SELECT * FROM currency_platform_trade_log WHERE user_id=? ORDER BY id DESC LIMIT ?,?", [user_id, start, length])
        return { total, list }
    },

    // 添加-记录
    async addLog(user_id, operator_id, coin_amount, coin_type, platform_coin_amount, platform_coin_type, notes, action) {
        const create_datetime = utils99.Time(config.web.timezone)
        const update_datetime = utils99.Time(config.web.timezone)
        const res = await db.Query("INSERT INTO currency_platform_trade_log(user_id, operator_id, coin_amount, coin_type, platform_coin_amount, platform_coin_type, notes, action, create_datetime, update_datetime) VALUES(?,?,?,?,?,?,?,?,?,?)", [user_id, operator_id, coin_amount, coin_type, platform_coin_amount, platform_coin_type, notes, action, create_datetime, update_datetime])
        return res
    },

    // 更新-平台币名称
    async updateNameByName(old_name, new_name) {
        const res = await db.Query("UPDATE currency_platform_trade_log SET `platform_coin_type`=? WHERE `platform_coin_type`=?", [new_name, old_name])
        return res
    },


}

module.exports = _t