const utils99 = require('node-utils99')
const config = require('../../config/all.js')
const { db } = require('../../lib/db.setup.js')

let _t = {
    // 查询
    async oneById(id) {
        let res = await db.Query("SELECT * FROM currency_platform WHERE id=? LIMIT 1", [id])
        return res.length > 0 ? res[0] : null
    },
    // 查询
    async oneBySymbol(symbol) {
        let res = await db.Query("SELECT * FROM currency_platform WHERE symbol=? LIMIT 1", [symbol])
        return res.length > 0 ? res[0] : null
    },
    // 平台币列表
    async list(start, length) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM currency_platform")
        total = total[0]['total']
        let list = await db.Query("SELECT * FROM currency_platform ORDER BY id DESC LIMIT ?,?", [start, length])
        return { total, list }
    },
    // 增加一个平台币
    async add(icon, symbol, name, value, sell_value, withdraw_charges, usdt_exchange, sort, abstract, desc, is_show, start_time, end_time) {
        const create_datetime = utils99.Time(config.web.timezone)
        const update_datetime = utils99.Time(config.web.timezone)
        const res = db.Query("INSERT INTO currency_platform(`icon`,`symbol`,`name`,`value`,`sell_value`,`withdraw_charges`,`usdt_exchange`,`sort`,`abstract`,`desc`,`is_show`,`start_time`,`end_time`,`create_datetime`,`update_datetime`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [icon, symbol, name, value, sell_value, withdraw_charges, usdt_exchange, sort, abstract, desc, is_show, start_time, end_time, create_datetime, update_datetime])
        return res
    },
    // 更新全部信息
    async update(id, icon, symbol, name, value, sell_value, withdraw_charges, usdt_exchange, sort, is_show, start_time, end_time) {
        const update_datetime = utils99.Time(config.web.timezone)
        const res = db.Query("UPDATE currency_platform SET `icon`=?,`symbol`=?,`name`=?,`value`=?,`sell_value`=?,`withdraw_charges`=?,`usdt_exchange`=?,`sort`=?,`is_show`=?,`start_time`=?,`end_time`=?,`update_datetime`=? WHERE id=?", [icon, symbol, name, value, sell_value, withdraw_charges, usdt_exchange, sort, is_show, start_time, end_time, update_datetime, id])
        return res
    },
    // 更新描述
    async updateDesc(id, abstract, desc) {
        const update_datetime = utils99.Time(config.web.timezone)
        const res = db.Query("UPDATE currency_platform SET `abstract`=?,`desc`=?,`update_datetime`=? WHERE id=?", [abstract, desc, update_datetime, id])
        return res
    }

}

module.exports = _t