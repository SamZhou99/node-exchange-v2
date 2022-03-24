const fs = require('fs');
const utils99 = require('node-utils99')
const ktFormat = require('../../lib/kline.time.format.js')
const { db } = require('../../lib/db.setup.js')

let _t = {
    async listBySymbol(symbol, period, size) {
        const res = db.Query("SELECT * FROM kline_history WHERE symbol=? AND period=? ORDER BY ts DESC LIMIT ?", [symbol, period, size])
        return res
    },
}


module.exports = _t