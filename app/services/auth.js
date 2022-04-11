const utils99 = require('node-utils99')
const { db } = require('../../lib/db.setup.js')

let _t = {
    // Auth
    async addAuthInfo(user_id, status, failed_reason, country, full_name, id_number) {
        const create_datetime = utils99.Time()
        const update_datetime = utils99.Time()
        // 更新
        const oneRes = await _t.oneById(user_id)
        if (oneRes != null) {
            const updateRes = await _t.updateAuthInfo(user_id, status, failed_reason, country, full_name, id_number)
            return updateRes
        }
        // 添加
        const res = await db.Query("INSERT INTO member_auth (`user_id`, `status`, `failed_reason`, `country`, `full_name`, `id_number`, `create_datetime`, `update_datetime`) VALUES(?, ?, ?, ?, ?, ?, ?, ?)",
            [user_id, status, failed_reason, country, full_name, id_number, create_datetime, update_datetime])
        return res
    },
    async updateAuthInfo(user_id, status, failed_reason, country, full_name, id_number) {
        // const create_datetime = utils99.Time()
        const update_datetime = utils99.Time()
        const res = await db.Query("UPDATE member_auth SET `status`=?, `failed_reason`=?, `country`=?, `full_name`=?, `id_number`=?, `update_datetime`=? WHERE user_id=?",
            [status, failed_reason, country, full_name, id_number, update_datetime, user_id])
        return res
    },
    async updateAuthStatus(user_id, status, failed_reason) {
        const update_datetime = utils99.Time()
        const res = await db.Query("UPDATE member_auth SET `status`=?, `failed_reason`=?, `update_datetime`=? WHERE user_id=?",
            [status, failed_reason, update_datetime, user_id])
        return res
    },
    async oneById(user_id) {
        const res = await db.Query("SELECT * FROM member_auth WHERE user_id=? LIMIT 1", [user_id])
        return res.length > 0 ? res[0] : null
    },



    // AuthPhoto
    async addPhoto(user_id, photo_name) {
        const create_datetime = utils99.Time()
        const update_datetime = utils99.Time()
        const res = await db.Query("INSERT INTO member_auth_photo (user_id, id_photo, create_datetime, update_datetime) VALUES(?, ?, ?, ?)",
            [user_id, photo_name, create_datetime, update_datetime])
        return res
    },
    async photoList(user_id, start, length) {
        const total = await db.Query("SELECT COUNT(0) AS total FROM member_auth_photo WHERE user_id=?", [user_id])
        const list = await db.Query("SELECT * FROM member_auth_photo WHERE user_id=? LIMIT ?,?", [user_id, start, length])
        return { total: total[0]['total'], list }
    },

}
module.exports = _t