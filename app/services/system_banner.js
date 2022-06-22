const utils99 = require('node-utils99')
const config = require('../../config/all.js')
const { db } = require('../../lib/db.setup.js')

let _t = {
    async add(img, sort, type) {
        const time = utils99.Time(config.web.timezone)
        const res = await db.Query("INSERT INTO system_banner (`img`,`sort`,`type`,`create_datetime`,`update_datetime`) VALUES(?,?,?,?,?)", [img, sort, type, time, time])
        return res
    },
    async deleteById(id) {
        const res = await db.Query("DELETE FROM system_banner WHERE id=?", [id])
        return res
    },
    async updateById(id, img, sort) {
        const time = utils99.Time(config.web.timezone)
        const res = await db.Query("UPDATE system_banner SET img=?, sort=?, update_datetime=? WHERE id=?", [img, sort, time, id])
        return res
    },
    async list() {
        const res = await db.Query("SELECT * FROM system_banner ORDER BY sort,id DESC")
        return res
    },
}
module.exports = _t