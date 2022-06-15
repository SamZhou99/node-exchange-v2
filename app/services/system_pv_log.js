const utils99 = require('node-utils99')
const { db } = require('../../lib/db.setup.js')

let _t = {
    async list(start, size) {
        const totalRes = await db.Query("SELECT COUNT(*) AS total FROM system_pv_log")
        const total = totalRes[0]['total']
        const list = await db.Query("SELECT * FROM system_pv_log ORDER BY id DESC LIMIT ?,?", [start, size])
        return { total, list, }
    },
    async add(user_id, ip, referer, url, user_agent) {
        const time = utils99.Time()
        const res = await db.Query("INSERT INTO system_pv_log (`user_id`,`ip`,`referer`,`url`,`user_agent`,`create_datetime`) VALUES (?,?,?,?,?,?)", [user_id, ip, referer, url, user_agent, time])
        return res
    },
    async clearBeforeMonth() {
        const currTS = new Date().getTime()
        // 7天前
        const befreTS = currTS - 1000 * 60 * 60 * 24 * 7
        const date = utils99.moment(befreTS).format('YYYY/MM/DD')
        console.log('date', date)
        const res = await db.Query(`DELETE system_pv_log WHERE create_datetime<?`, [date])
        return res
    },
    async deleteById(id) {
        const res = await db.Query(`DELETE system_pv_log WHERE id=?`, [id])
        return res
    },
}
module.exports = _t