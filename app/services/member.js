const utils99 = require('node-utils99')
const config = require('../../config/all.js')
const { db } = require('../../lib/db.setup.js')
const service_auth = require('./auth.js')
const service_agent = require('./agent.js')
const service_wallet = require('./wallet.js')


let _t = {
    // 创建会员
    async createMember(agent_id, account, password, notes, type, status, email_verify, ip) {
        const create_datetime = utils99.Time(config.web.timezone)
        const update_datetime = utils99.Time(config.web.timezone)
        const res = await db.Query("INSERT INTO member_list (agent_id, account, password, notes, type, status, email_verify, ip, create_datetime, update_datetime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [agent_id, account, password, notes, type, status, email_verify, ip, create_datetime, update_datetime])
        return res
    },

    // 通过ID 查询一条记录
    async oneById(id) {
        const res = await db.Query("SELECT * FROM member_list WHERE id=? LIMIT 1", [id])
        if (res.length > 0) {
            let member = res[0]
            delete member.password
            return member
        }
        return null
    },
    // 通过账号 查询一条记录
    async oneByAccount(account) {
        const res = await db.Query("SELECT * FROM member_list WHERE account=? LIMIT 1", [account])
        if (res.length > 0) {
            let member = res[0]
            delete member.password
            return member
        }
        return null
    },
    // 通过账号密码 查询一条记录
    async oneByAccountPassword(account, password, status) {
        const res = await db.Query("SELECT * FROM member_list WHERE account=? AND password=? AND status=? AND deleted=0 LIMIT 1", [account, password, status])
        if (res.length > 0) {
            let member = res[0]
            delete member.password
            delete member.notes
            return member
        }
        return null
    },

    // 会员列表
    async list(start, length) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM member_list WHERE deleted=0")
        total = total[0]['total']
        let list = await db.Query("SELECT * FROM member_list WHERE deleted=0 ORDER BY id DESC LIMIT ?,?", [start, length])
        for (let i = 0; i < list.length; i++) {
            let item = list[i]
            delete item.password
        }
        return { total, list }
    },

    /**
     * 会员列表详细信息
     * @param {*} type 用户类型，0普通，1营销号
     * @param {*} start 
     * @param {*} length 
     * @returns 
     */
    async listDetail(type, target_user_id, start, length) {
        let total, list
        if (target_user_id) {
            total = await db.Query("SELECT COUNT(0) AS total FROM member_list WHERE id=?", [target_user_id])
            total = total[0]['total']
            list = await db.Query("SELECT * FROM member_list WHERE id=? ORDER BY id DESC LIMIT ?,?", [target_user_id, start, length])
        } else {
            total = await db.Query("SELECT COUNT(0) AS total FROM member_list WHERE deleted=0 AND type=?", [type])
            total = total[0]['total']
            list = await db.Query("SELECT * FROM member_list WHERE deleted=0 AND type=? ORDER BY id DESC LIMIT ?,?", [type, start, length])
        }

        for (let i = 0; i < list.length; i++) {
            let user = list[i]
            delete user.password
            let authPhotoRes = await service_auth.photoList(user.id, 0, 5)
            user.authPhoto = authPhotoRes.list
            user.auth = await service_auth.oneById(user.id)
            user.agent = await service_agent.oneById(user.agent_id)
            user.walletList = await service_wallet.list(user.id)
        }
        return { total, list }
    },
    async listDetailByAgentId(agent_id, type, target_user_id, start, length) {
        let total, list
        if (target_user_id) {
            total = await db.Query("SELECT COUNT(0) AS total FROM member_list WHERE id=?", [target_user_id])
            total = total[0]['total']
            list = await db.Query("SELECT * FROM member_list WHERE id=? ORDER BY id DESC LIMIT ?,?", [target_user_id, start, length])
        } else {
            total = await db.Query("SELECT COUNT(0) AS total FROM member_list WHERE deleted=0 AND type=? AND id IN (SELECT id FROM member_list WHERE agent_id=?)", [type, agent_id])
            total = total[0]['total']
            list = await db.Query("SELECT * FROM member_list WHERE deleted=0 AND type=? AND id IN (SELECT id FROM member_list WHERE agent_id=?) ORDER BY id DESC LIMIT ?,?", [type, agent_id, start, length])
        }

        for (let i = 0; i < list.length; i++) {
            let user = list[i]
            delete user.password
            let authPhotoRes = await service_auth.photoList(user.id, 0, 5)
            user.authPhoto = authPhotoRes.list
            user.auth = await service_auth.oneById(user.id)
            user.agent = await service_agent.oneById(user.agent_id)
            user.walletList = await service_wallet.list(user.id)
        }
        return { total, list }
    },

    // 某段时间 注册人数
    async listByDateBetween(startDate, endDate) {
        let list = await db.Query("SELECT * FROM member_list WHERE type=0 AND create_datetime BETWEEN ? AND ? ORDER BY id DESC", [startDate, endDate])
        return list
    },
    async listByDateBetweenByAgentId(agent_id, startDate, endDate) {
        let list = await db.Query("SELECT * FROM member_list WHERE type=0 AND create_datetime BETWEEN ? AND ? AND agent_id=? ORDER BY id DESC", [startDate, endDate, agent_id])
        return list
    },

    // 会员列表 通过 代理ID 查询
    async listByAgentId(agent_id, length) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM member_list WHERE agent_id=?", [agent_id])
        total = total[0]['total']
        let list = await db.Query("SELECT * FROM member_list WHERE agent_id=? ORDER BY id DESC LIMIT ?", [agent_id, length])
        for (let i = 0; i < list.length; i++) {
            let item = list[i]
            delete item.password
        }
        return { total, list }
    },
    async countByAgentId(agent_id) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM member_list WHERE agent_id=?", [agent_id])
        total = total[0]['total']
        return total
    },

    // 自动完成账号名
    async listByAccount(account, limit) {
        const list = await db.Query("SELECT id,account FROM member_list WHERE account LIKE ? ORDER BY id DESC LIMIT ?", [`%${account}%`, limit])
        return list
    },
    async listByAccountByAgentId(agent_id, account, limit) {
        const list = await db.Query("SELECT id,account FROM member_list WHERE agent_id=? AND account LIKE ? ORDER BY id DESC LIMIT ?", [agent_id, `%${account}%`, limit])
        return list
    },

    // 更新某个字段的属性
    async updateFieldValue(user_id, key, value) {
        const res = await db.Query(`UPDATE member_list SET ${key}=? WHERE id=? LIMIT 1`, [value, user_id])
        return res
    },

    // 最近注册的用户(非营销号)
    async lastMember(limit = 5) {
        const res = await db.Query("SELECT * FROM member_list WHERE type=0 ORDER BY id DESC LIMIT ?", [limit])
        return res
    }
}

module.exports = _t