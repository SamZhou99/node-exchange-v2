const utils99 = require('node-utils99')
const config = require('../../config/all.js');
const { db } = require('../../lib/db.setup.js')


let _t = {
    async oneById(id) {
        let res = await db.Query("SELECT * FROM articles_category WHERE id=?", [id])
        return res.length > 0 ? res[0] : null
    },

    async list() {
        let list = await db.Query("SELECT * FROM articles_category ORDER BY sort DESC ")
        return list
    },

    async add(label, sort) {
        const res = await db.Query("INSERT INTO articles_category(`label`,`sort`) VALUES(?,?)", [label, sort])
        return res
    },

    async update(id, label, sort) {
        const res = await db.Query("UPDATE articles_category SET label=?, sort=? WHERE id=?", [label, sort, id])
        return res
    },

    async delete(id) {
        const res = await db.Query("DELETE FROM articles_category WHERE id=?", [id])
        return res
    }

}

module.exports = _t