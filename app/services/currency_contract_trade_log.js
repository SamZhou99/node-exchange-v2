const utils99 = require('node-utils99')
const config = require('../../config/all.js');
const { db } = require('../../lib/db.setup.js')

let _t = {

    // oneById
    async oneById(id) {
        let res = await db.Query("SELECT * FROM currency_contract_trade_log WHERE id=?", [id])
        return res.length > 0 ? res[0] : null
    },

    // 查询列表
    async list(start, length) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM currency_contract_trade_log", [])
        total = total[0]['total']
        let list = await db.Query("SELECT * FROM currency_contract_trade_log ORDER BY id DESC LIMIT ?,?", [start, length])
        return { total, list }
    },

    // 查询列表 通过 币种类
    async listBySymbol(symbol, start, length) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM currency_contract_trade_log WHERE symbol=? AND (status=1 OR status=2)", [symbol])
        total = total[0]['total']
        let list = await db.Query("SELECT * FROM currency_contract_trade_log WHERE symbol=? AND (status=1 OR status=2) ORDER BY id DESC LIMIT ?,?", [symbol, start, length])
        return { total, list }
    },

    // 查询列表 通过 用户ID
    async listByCloseUserId(user_id, status, start, length) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM currency_contract_trade_log WHERE user_id=? AND status=?", [user_id, status])
        total = total[0]['total']
        let list = await db.Query("SELECT * FROM currency_contract_trade_log WHERE user_id=? AND status=? ORDER BY update_datetime DESC LIMIT ?,?", [user_id, status, start, length])
        return { total, list }
    },
    async listByTradeUserId(user_id) {
        let list = await db.Query("SELECT * FROM currency_contract_trade_log WHERE user_id=? AND status<4 ORDER BY id DESC", [user_id])
        return list
    },

    // 添加记录
    async addLog(user_id, lever, status, charges, price, lots, sum, action, symbol, balance) {
        const create_datetime = utils99.Time(config.web.timezone)
        const update_datetime = utils99.Time(config.web.timezone)
        const res = await db.Query("INSERT INTO currency_contract_trade_log (`user_id`,`lever`,`status`,`charges`,`price`,`lots`,`sum`,`action`,`symbol`,`balance`,`create_datetime`,`update_datetime`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", [user_id, lever, status, charges, price, lots, sum, action, symbol, balance, create_datetime, update_datetime])
        return res
    },

    // 更新状态
    async updateFieldValue(id, fieldName, fieldValue) {
        const update_datetime = utils99.Time(config.web.timezone)
        const sql = `UPDATE currency_contract_trade_log SET \`${fieldName}\`=?, \`update_datetime\`=? WHERE id=?`
        const res = await db.Query(sql, [fieldValue, update_datetime, id])
        return res
    },

    // 更新 状态,平仓价格
    async updateStatusAndPriceSell(id, status, status_type, priceSell) {
        const update_datetime = utils99.Time(config.web.timezone)
        const sql = `UPDATE currency_contract_trade_log SET status=?, status_type=?, price_sell=?, update_datetime=? WHERE id=?`
        const res = await db.Query(sql, [status, status_type, priceSell, update_datetime, id])
        return res
    },

    // 更新 止盈 止损
    async updateBuyStopSellStop(id, buy_stop, sell_stop) {
        const update_datetime = utils99.Time(config.web.timezone)
        const sql = `UPDATE currency_contract_trade_log SET buy_stop=?, sell_stop=?, update_datetime=? WHERE id=?`
        const res = await db.Query(sql, [buy_stop, sell_stop, update_datetime, id])
        return res
    },
}

module.exports = _t