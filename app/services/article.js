const utils99 = require('node-utils99')
const config = require('../../config/all.js');
const { db } = require('../../lib/db.setup.js')

let _t = {

    async oneById(id) {
        let res = await db.Query("SELECT * FROM articles_list WHERE id=?", id)
        return res.length > 0 ? res[0] : null
    },

    async list(start, size) {
        let totalRes = await db.Query("SELECT COUNT(0) AS total FROM articles_list")
        let total = totalRes[0]['total']
        let list = await db.Query("SELECT id,sort,category_id,title,create_datetime,update_datetime FROM articles_list ORDER BY sort,id DESC LIMIT ?,?", [start, size])
        return { total, list }
    },

    async add(title, content, category_id, sort) {
        const time = utils99.Time(config.web.timezone)
        const res = await db.Query("INSERT INTO articles_list(`title`,`content`,`category_id`,`sort`,`create_datetime`,`update_datetime`) VALUES(?,?,?,?,?,?)", [title, content, category_id, sort, time, time])
        return res
    },

    async update(id, title, content, category_id, sort, create_datetime) {
        const update_datetime = utils99.Time(config.web.timezone)
        const res = await db.Query("UPDATE articles_list SET title=?, content=?, category_id=?, sort=?, create_datetime=?, update_datetime=? WHERE id=?", [title, content, category_id, sort, create_datetime, update_datetime, id])
        return res
    },

    async delete(id) {
        const res = await db.Query("DELETE FROM articles_list WHERE id=?", [id])
        return res
    }

}

module.exports = _t