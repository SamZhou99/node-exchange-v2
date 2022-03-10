const utils99 = require('node-utils99')
const { db } = require('../../lib/db.setup.js')

let _t = {
    async oneBySymbol(symbol) {
        let res = await db.Query("SELECT * FROM platform_currency WHERE symbol=? LIMIT 1", [symbol])
        return res.length > 0 ? res[0] : null
    },
    // 登录日志列表
    async list(start, length) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM platform_currency")
        total = total[0]['total']
        let list = await db.Query("SELECT * FROM platform_currency ORDER BY id DESC LIMIT ?,?", [start, length])
        return { total, list }
    }
}

module.exports = _t