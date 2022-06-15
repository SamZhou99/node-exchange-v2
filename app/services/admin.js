const utils99 = require('node-utils99')
const config = require('../../config/all.js');
const { db } = require('../../lib/db.setup.js')
const service_auth = require('./auth.js')
const service_agent = require('./agent.js')
const service_wallet = require('./wallet.js')


let _t = {
    // 通过账号 查询一条记录
    async oneById(id) {
        const res = await db.Query("SELECT * FROM admin_list WHERE id=? LIMIT 1", [id])
        if (res.length > 0) {
            let item = res[0]
            delete item.password
            return item
        }
        return null
    },
    // 通过账号密码 查询一条记录
    async oneByAccountPassword(account, password, status) {
        const res = await db.Query("SELECT * FROM admin_list WHERE account=? AND password=? AND status=? LIMIT 1", [account, password, status])
        if (res.length > 0) {
            let member = res[0]
            delete member.password
            return member
        }
        return null
    },
    // 通过ID&密码 查询一条记录
    async oneByIdPassword(id, password, status) {
        const res = await db.Query("SELECT * FROM admin_list WHERE id=? AND password=? AND status=? LIMIT 1", [id, password, status])
        if (res.length > 0) {
            let member = res[0]
            delete member.password
            return member
        }
        return null
    },
    // 修改密码
    async updatePassword(id, password) {
        const update_datetime = utils99.Time(config.web.timezone)
        const res = await db.Query(`UPDATE admin_list SET password=?,update_datetime=? WHERE id=? LIMIT 1`, [password, update_datetime, id])
        return res
    }
}

module.exports = _t