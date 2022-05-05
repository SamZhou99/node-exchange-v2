const utils99 = require('node-utils99')
const { db } = require('../../lib/db.setup.js')

function randomCode() {
    const chat = "abcdefghijklmnopqrstuvwxyz1234567890"
    let s = ''
    for (let i = 0; i < 4; i++) {
        s += chat[Math.floor(Math.random() * chat.length)]
    }
    return s
}
let _t = {
    async randomCode() {
        for (let i = 0; i < 255; i++) {
            const code = randomCode()
            const res = await _t.oneByCode(code)
            if (res == null) {
                return code
            }
        }
        return null
    },
    async oneByCode(invite_code) {
        const res = await db.Query("SELECT * FROM agent_list WHERE invite_code=?", [invite_code])
        return res.length > 0 ? res[0] : null
    },
    async oneById(agent_id) {
        const res = await db.Query("SELECT * FROM agent_list WHERE id=?", [agent_id])
        if (res.length > 0) {
            delete res[0].password
            return res[0]
        }
        return null
    },
    async list(start, length) {
        const totalRes = await db.Query("SELECT COUNT(0) AS total FROM agent_list")
        const total = totalRes[0].total
        const list = await db.Query("SELECT * FROM agent_list ORDER BY id DESC LIMIT ?,?", [start, length])
        return { total, list }
    },

    async add(account, password, notes, invite_code, type, status) {
        const create_datetime = utils99.Time()
        const update_datetime = utils99.Time()
        const res = await db.Query("INSERT INTO agent_list(account, password, notes, invite_code, type, status, create_datetime, update_datetime) VALUES(?,?,?,?,?,?,?,?)", [account, password, notes, invite_code, type, status, create_datetime, update_datetime])
        return res
    },

    async update(agent_id, key, value) {
        const res = await db.Query(`UPDATE agent_list SET ${key}=? WHERE id=?`, [value, agent_id])
        return res
    }
}
module.exports = _t