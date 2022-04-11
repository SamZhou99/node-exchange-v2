const utils99 = require('node-utils99')
const { db } = require('../../lib/db.setup.js')
const service_auth = require('./auth.js')
const service_agent = require('./agent.js')
const service_wallet = require('./wallet.js')


let _t = {
    // // 创建会员
    // async createMember(agent_id, account, password, notes, type, status, email_verify, ip) {
    //     const create_datetime = utils99.Time()
    //     const update_datetime = utils99.Time()
    //     const res = await db.Query("INSERT INTO admin_list (agent_id, account, password, notes, type, status, email_verify, ip, create_datetime, update_datetime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [agent_id, account, password, notes, type, status, email_verify, ip, create_datetime, update_datetime])
    //     return res
    // },
    // // 通过账号 查询一条记录
    // async oneByAccount(account) {
    //     const res = await db.Query("SELECT * FROM admin_list WHERE account=? LIMIT 1", [account])
    //     if (res.length > 0) {
    //         let member = res[0]
    //         delete member.password
    //         return member
    //     }
    //     return null
    // },
    // 通过账号密码 查询一条记录
    async oneByAccountPassword(account, password, status) {
        const res = await db.Query("SELECT * FROM admin_list WHERE account=? AND password=? AND status=? LIMIT 1", [account, password, status])
        if (res.length > 0) {
            let member = res[0]
            delete member.password
            delete member.notes
            return member
        }
        return null
    },
    // // 会员列表
    // async list(start, length) {
    //     let total = await db.Query("SELECT COUNT(0) AS total FROM admin_list")
    //     total = total[0]['total']
    //     let list = await db.Query("SELECT * FROM admin_list ORDER BY id DESC LIMIT ?,?", [start, length])
    //     for (let i = 0; i < list.length; i++) {
    //         let item = list[i]
    //         delete item.password
    //     }
    //     return { total, list }
    // },

    // // 会员列表详细信息
    // async listDetail(start, length) {
    //     let total = await db.Query("SELECT COUNT(0) AS total FROM admin_list")
    //     total = total[0]['total']
    //     let list = await db.Query("SELECT * FROM admin_list ORDER BY id DESC LIMIT ?,?", [start, length])

    //     for (let i = 0; i < list.length; i++) {
    //         let item = list[i]
    //         delete item.password
    //         let authPhotoRes = await service_auth.photoList(item.id, 0, 5)
    //         item.authPhoto = authPhotoRes.list
    //         item.auth = await service_auth.oneById(item.id)
    //         item.agent = await service_agent.oneById(item.agent_id)
    //         item.walletList = await service_wallet.list(item.id)
    //     }
    //     return { total, list }
    // },

    // // 自动完成账号名
    // async listByAccount(account, limit) {
    //     const list = await db.Query("SELECT id,account FROM admin_list WHERE account LIKE ? ORDER BY id DESC LIMIT ?", [`%${account}%`, limit])
    //     return list
    // },

    // // 更新某个字段的属性
    // async updateFieldValue(user_id, key, value) {
    //     const res = await db.Query(`UPDATE admin_list SET ${key}=? WHERE id=? LIMIT 1`, [value, user_id])
    //     return res
    // }
}

module.exports = _t