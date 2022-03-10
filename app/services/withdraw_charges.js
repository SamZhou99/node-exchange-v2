const utils99 = require('node-utils99')
const { db } = require('../../lib/db.setup.js')

let _t = {
    async list() {
        const list = await db.Query("SELECT * FROM member_withdraw_charges")
        return list
    },
}
module.exports = _t