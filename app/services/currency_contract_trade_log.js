const utils99 = require('node-utils99')
const { db } = require('../../lib/db.setup.js')

let _t = {
    // async oneBySymbol(symbol) {
    //     let res = await db.Query("SELECT * FROM currency_contract_trade_log WHERE symbol=? LIMIT 1", [symbol])
    //     return res.length > 0 ? res[0] : null
    // },
    // 登录日志列表
    async listByUserId(user_id, start, length) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM currency_contract_trade_log WHERE user_id=?", [user_id])
        total = total[0]['total']
        let list = await db.Query("SELECT * FROM currency_contract_trade_log WHERE user_id=? ORDER BY id DESC LIMIT ?,?", [user_id, start, length])
        return { total, list }
    },
    // 添加记录
    // user_id, multiple, status, handling_fee, price, lots, margin, 'add', symbol
    async addLog(user_id, lever, status, charges, price, lots, sum, action, symbol) {
        const create_datetime = utils99.Time()
        const update_datetime = utils99.Time()
        let res = await db.Query("INSERT INTO currency_contract_trade_log (`user_id`,`lever`,`status`,`charges`,`price`,`lots`,`sum`,`action`,`symbol`,`create_datetime`,`update_datetime`) VALUES (?,?,?,?,?,?,?,?,?,?,?)", [user_id, lever, status, charges, price, lots, sum, action, symbol, create_datetime, update_datetime])
        return res
    }
}

module.exports = _t