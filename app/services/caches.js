const utils99 = require('node-utils99')
const { db } = require('../../lib/db.setup.js')

module.exports = {
    async oneByKey(key) {
        const res = await db.Query("SELECT * FROM caches WHERE `key`=? LIMIT 1", [key])
        return res.length > 0 ? res[0] : null
    },
}