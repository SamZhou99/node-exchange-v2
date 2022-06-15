const utils99 = require('node-utils99')
const config = require('../../../config/all.js')
const { db } = require('../../../lib/db.setup.js')

let _t = {
    getVerifyCode(chars) {
        const ch = chars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
        let s = ''
        for (let i = 0; i < 6; i++) {
            const r = Math.floor(ch.length * Math.random())
            s += ch.substring(r, r + 1)
        }
        return s
    },
    async oneByEmail(email) {
        const res = await db.Query("SELECT * FROM email_verify_code WHERE email=? LIMIT 1", [email])
        return res.length > 0 ? res[0] : null
    },
    async oneByEmailCode(email, code) {
        const res = await db.Query("SELECT * FROM email_verify_code WHERE email=? AND code=? LIMIT 1", [email, code])
        return res.length > 0 ? res[0] : null
    },
    async add(email, code) {
        const status = 0
        const time = utils99.Time(config.web.timezone)
        const res = await db.Query("INSERT INTO email_verify_code (email,code,status,create_datetime,update_datetime) VALUES(?,?,?,?,?)", [email, code, status, time, time])
        return res
    },
    async updateStatusByEmailCode(status, email, code) {
        const time = utils99.Time(config.web.timezone)
        const res = await db.Query("UPDATE email_verify_code SET status=?,update_datetime=? WHERE email=? AND code=? LIMIT 1", [status, time, email, code])
        return res
    }
}

module.exports = _t