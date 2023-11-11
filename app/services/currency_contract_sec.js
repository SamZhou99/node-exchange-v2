const utils99 = require('node-utils99')
const config = require('../../config/all.js');
const { db } = require('../../lib/db.setup.js');

let _t = {
    // 查询
    async oneById(id) {
        let res = await db.Query("SELECT * FROM currency_contract_sec WHERE id=? LIMIT 1", [id])
        return res.length > 0 ? res[0] : null
    },
    // 列表
    async list(start, length) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM currency_contract_sec")
        total = total[0]['total']
        let list = await db.Query("SELECT * FROM currency_contract_sec ORDER BY id DESC LIMIT ?,?", [start, length])
        return { total, list }
    },
    async listByAgentId(agent_id, start, length) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM currency_contract_sec WHERE user_id IN (SELECT id FROM member_list WHERE agent_id=?)", [agent_id])
        total = total[0]['total']
        let list = await db.Query("SELECT * FROM currency_contract_sec WHERE user_id IN (SELECT id FROM member_list WHERE agent_id=?) ORDER BY id DESC LIMIT ?,?", [agent_id, start, length])
        return { total, list }
    },
    // 用户 列表
    async listByUserId(user_id, start, length, status = 1) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM currency_contract_sec WHERE status=? AND user_id=?", [status, user_id])
        total = total[0]['total']
        let list = await db.Query("SELECT * FROM currency_contract_sec WHERE status=? AND user_id=? ORDER BY id DESC LIMIT ?,?", [status, user_id, start, length])
        return { total, list }
    },
    async listByStatus(status) {
        let list = await db.Query("SELECT * FROM currency_contract_sec WHERE status=? ORDER BY id DESC", [status])
        return list
    },
    // 用户 历史列表
    async listHistoryByUserId(user_id, start, length) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM currency_contract_sec WHERE status=0 AND user_id=?", [user_id])
        total = total[0]['total']
        let list = await db.Query("SELECT * FROM currency_contract_sec WHERE status=0 AND user_id=? ORDER BY id DESC LIMIT ?,?", [user_id, start, length])
        return { total, list }
    },
    // 增加
    async add(user_id, sec, rate, amount_buy, amount_result, price_buy, price_pay, balance, action, status) {
        const create_datetime = utils99.Time(config.web.timezone)
        const update_datetime = utils99.Time(config.web.timezone)
        const res = await db.Query("INSERT INTO currency_contract_sec(`user_id`, `sec`, `rate`, `amount_buy`, `amount_result`, `price_buy`, `price_pay`, `balance`, `action`, `status`, `create_datetime`,`update_datetime`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)", [user_id, sec, rate, amount_buy, amount_result, price_buy, price_pay, balance, action, status, create_datetime, update_datetime])
        return res
    },
    // 更新
    async update(id, user_id, sec, rate, amount_buy, amount_result, price_buy, price_pay, balance, action, status) {
        const update_datetime = utils99.Time(config.web.timezone)
        const res = await db.Query("UPDATE currency_contract_sec SET `user_id`=?, `sec`=?, `rate`=?, `amount_buy`=?, `amount_result`=?, `price_buy`=?, `price_pay`=?, `balance`=?, `action`=?, `status`=?, `update_datetime`=? WHERE id=?", [user_id, sec, rate, amount_buy, amount_result, price_buy, price_pay, balance, action, status, update_datetime, id])
        return res
    },
    async updateById(id, amount_result, price_pay, status) {
        const update_datetime = utils99.Time(config.web.timezone)
        const res = await db.Query("UPDATE currency_contract_sec SET `amount_result`=?, `price_pay`=?, `status`=?, `update_datetime`=? WHERE id=?", [amount_result, price_pay, status, update_datetime, id])
        return res
    },
    // 更新 手动控制输赢 值
    async updateManualById(id, manual) {
        const update_datetime = utils99.Time(config.web.timezone)
        const res = await db.Query("UPDATE currency_contract_sec SET `manual`=?, `update_datetime`=? WHERE id=?", [manual, update_datetime, id])
        return res
    }
}

module.exports = _t