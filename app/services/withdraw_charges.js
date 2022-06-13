const utils99 = require('node-utils99')
const { db } = require('../../lib/db.setup.js')

let _t = {
    async list() {
        const list = await db.Query("SELECT * FROM member_withdraw_charges")
        return list
    },
    async oneByCoinName(coinName) {
        const res = await db.Query("SELECT * FROM member_withdraw_charges WHERE label=?", [coinName])
        return res.length > 0 ? res[0] : null
    },
    // 更新某个字段的属性
    async updateFieldValue(id, key, value) {
        const res = await db.Query(`UPDATE member_withdraw_charges SET ${key}=? WHERE id=?`, [value, id])
        return res
    },
}
module.exports = _t