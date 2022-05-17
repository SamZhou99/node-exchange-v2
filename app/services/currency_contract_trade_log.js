const utils99 = require('node-utils99')
const { db } = require('../../lib/db.setup.js')

let _t = {
    // async oneBySymbol(symbol) {
    //     let res = await db.Query("SELECT * FROM currency_contract_trade_log WHERE symbol=? LIMIT 1", [symbol])
    //     return res.length > 0 ? res[0] : null
    // },

    // 查询列表 通过 币种类
    async listBySymbol(symbol, start, length) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM currency_contract_trade_log WHERE symbol=? AND (status=1 OR status=2)", [symbol])
        total = total[0]['total']
        let list = await db.Query("SELECT * FROM currency_contract_trade_log WHERE symbol=? AND (status=1 OR status=2) ORDER BY id DESC LIMIT ?,?", [symbol, start, length])
        return { total, list }
    },

    // 查询列表 通过 用户ID
    async listByUserId(user_id, start, length) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM currency_contract_trade_log WHERE user_id=?", [user_id])
        total = total[0]['total']
        let list = await db.Query("SELECT * FROM currency_contract_trade_log WHERE user_id=? ORDER BY id DESC LIMIT ?,?", [user_id, start, length])
        return { total, list }
    },

    // 添加记录
    async addLog(user_id, lever, status, charges, price, lots, sum, action, symbol) {
        const create_datetime = utils99.Time()
        const update_datetime = utils99.Time()
        const res = await db.Query("INSERT INTO currency_contract_trade_log (`user_id`,`lever`,`status`,`charges`,`price`,`lots`,`sum`,`action`,`symbol`,`create_datetime`,`update_datetime`) VALUES (?,?,?,?,?,?,?,?,?,?,?)", [user_id, lever, status, charges, price, lots, sum, action, symbol, create_datetime, update_datetime])
        return res
    },

    // 更新状态
    async updateFieldValue(id, fieldName, fieldValue) {
        const update_datetime = utils99.Time()
        const sql = `UPDATE currency_contract_trade_log SET \`${fieldName}\`=?, \`update_datetime\`=? WHERE id=?`
        const res = await db.Query(sql, [fieldValue, update_datetime, id])
        return res
    },

    // 更新 状态,平仓价格
    async updateStatusAndPriceSell(id, status, priceSell) {
        const update_datetime = utils99.Time()
        const sql = `UPDATE currency_contract_trade_log SET status=?, price_sell=?, update_datetime=? WHERE id=?`
        const res = await db.Query(sql, [status, priceSell, update_datetime, id])
        return res
    },

    // 更新 止盈 止损
    async updateBuyStopSellStop(id, buy_stop, sell_stop) {
        const update_datetime = utils99.Time()
        const sql = `UPDATE currency_contract_trade_log SET buy_stop=?, sell_stop=?, update_datetime=? WHERE id=?`
        const res = await db.Query(sql, [buy_stop, sell_stop, update_datetime, id])
        return res
    },
}

module.exports = _t