const { db } = require('../../lib/db.setup.js')

module.exports = {
    async list() {
        const res = await db.Query("SELECT * FROM config")
        return res
    }
}