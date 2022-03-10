const utils99 = require('node-utils99')
const { db } = require('../../lib/db.setup.js')

let _t = {
    async list(user_id) {
        const res = await db.Query("SELECT * FROM member_wallet WHERE user_id=?", [user_id])
        return res
    },
}
module.exports = _t