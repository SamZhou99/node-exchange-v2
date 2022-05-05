const utils99 = require('node-utils99')
const { db } = require('../../lib/db.setup.js')

let _t = {
    // 查询
    async oneById(id) {
        let res = await db.Query("SELECT * FROM currency_contract WHERE id=? LIMIT 1", [id])
        return res.length > 0 ? res[0] : null
    },
    // 查询 通过符号
    async oneBySymbol(symbol) {
        let res = await db.Query("SELECT * FROM currency_contract WHERE symbol=? LIMIT 1", [symbol])
        return res.length > 0 ? res[0] : null
    },
    // 登录日志列表
    async list(start, length) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM currency_contract")
        total = total[0]['total']
        let list = await db.Query("SELECT * FROM currency_contract ORDER BY id DESC LIMIT ?,?", [start, length])
        return { total, list }
    },
    // 增加
    async add(icon, symbol, name, charges, amount, close_a_position, sort, is_show) {
        const create_datetime = utils99.Time()
        const update_datetime = utils99.Time()
        const res = await db.Query("INSERT INTO currency_contract(`icon`, `symbol`, `name`, `charges`, `amount`, `close_a_position`, `sort`, `is_show`,`create_datetime`,`update_datetime`) VALUES(?,?,?,?,?,?,?,?,?,?)", [icon, symbol, name, charges, amount, close_a_position, sort, is_show, create_datetime, update_datetime])
        return res
    },
    // 更新
    async update(id, icon, symbol, name, charges, amount, close_a_position, sort, is_show) {
        const update_datetime = utils99.Time()
        const res = await db.Query("UPDATE currency_contract SET `icon`=?, `symbol`=?, `name`=?, `charges`=?, `amount`=?, `close_a_position`=?, `sort`=?, `is_show`=?, `update_datetime`=? WHERE id=?", [icon, symbol, name, charges, amount, close_a_position, sort, is_show, update_datetime, id])
        return res
    }
}

module.exports = _t