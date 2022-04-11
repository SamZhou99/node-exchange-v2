const utils99 = require('node-utils99')
const { db } = require('../../lib/db.setup.js')

let _t = {
    async list(user_id, start, length) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM member_wallet_log WHERE user_id=?", [user_id])
        total = total[0]['total']
        const list = await db.Query("SELECT * FROM member_wallet_log WHERE user_id=? ORDER BY id DESC LIMIT ?,?", [user_id, start, length])
        return { total, list }
    },

    // `user_id` int(10) unsigned DEFAULT '0' COMMENT '用户ID',
    // `operator_id` int(10) unsigned DEFAULT '0' COMMENT '操作者ID',
    // `action` enum('sub','add') DEFAULT NULL COMMENT '上下分',
    // `amount` decimal(20,8) unsigned DEFAULT '0.00000000' COMMENT '资产账户',
    // `hash` varchar(255) DEFAULT NULL COMMENT '交易哈希',
    // `to_address` varchar(255) DEFAULT NULL COMMENT '到达地址',
    // `wallet_type` enum('usdt','eth','btc') DEFAULT NULL COMMENT '类型',
    // `notes` varchar(255) DEFAULT '' COMMENT '备注',
    // `time` datetime DEFAULT NULL COMMENT '区块链交易时间',
    // `create_datetime` datetime DEFAULT NULL COMMENT '创建时间',
    // `update_datetime` datetime DEFAULT NULL COMMENT '更新时间',
    async addLog(user_id, operator_id, action, amount, hash, to_address, wallet_type, notes, time) {
        const create_datetime = utils99.Time()
        const update_datetime = utils99.Time()
        const res = await db.Query("INSERT INTO member_wallet_log(user_id, operator_id, action, amount, hash, to_address, wallet_type, notes, time, create_datetime, update_datetime) VALUES(?,?,?,?,?,?,?,?,?,?,?)", [user_id, operator_id, action, amount, hash, to_address, wallet_type, notes, time, create_datetime, update_datetime])
        return res
    }
}
module.exports = _t