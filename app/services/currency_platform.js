const utils99 = require('node-utils99')
const { db } = require('../../lib/db.setup.js')

let _t = {
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
    }
}

module.exports = _t