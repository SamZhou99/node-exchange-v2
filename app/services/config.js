const { db } = require('../../lib/db.setup.js')

module.exports = {
    async list() {
        const res = await db.Query("SELECT * FROM config")
        return res
    },
    async update(id, key, value) {
        const res = await db.Query("UPDATE config SET `key`=?, `value`=? WHERE id=?",
            [key, value, id])
        return res
    },
    async insert(key, value) {
        const res = await db.Query("INSERT INTO config (`key`, `value`) VALUES(?,?)", [key, value])
        return res
    },
    async delete(id) {
        const res = await db.Query("DELETE FROM config WHERE id=?", [id])
        return res
    }
}