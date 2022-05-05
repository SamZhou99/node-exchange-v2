const utils99 = require('node-utils99')
const { db } = require('../../lib/db.setup.js')

let _t = {
    async list() {
        const res = await db.Query("SELECT * FROM system_session ORDER BY id DESC LIMIT 0,256")
        return res
    },
    async oneByToken(token) {
        const res = await db.Query("SELECT * FROM system_session WHERE to_ken=? LIMIT 1", [token])
        return res.length > 0 ? res[0] : null
    },
    async add(user_id, token) {
        const time = utils99.Time()
        const res = await db.Query("INSERT INTO system_session (`user_id`,`to_ken`,`create_datetime`) VALUES (?,?,?)", [user_id, token, time])
        return res
    },
    async deleteById(id) {
        const res = await db.Query(`DELETE system_session WHERE id=?`, [id])
        return res
    },
    async deleteByToken(token) {
        const res = await db.Query(`DELETE system_session WHERE to_ken=?`, [token])
        return res
    },
}
module.exports = _t