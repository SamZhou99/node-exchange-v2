const utils99 = require('node-utils99')
const { db } = require('../../lib/db.setup.js')

let _t = {
    // // 登录日志列表
    // async list(start, length) {
    //     let total = await db.Query("SELECT COUNT(0) AS total FROM currency_platform")
    //     total = total[0]['total']
    //     let list = await db.Query("SELECT * FROM currency_platform ORDER BY id DESC LIMIT ?,?", [start, length])
    //     return { total, list }
    // }

    // `user_id` int(10) unsigned DEFAULT '0' COMMENT '用户ID',
    // `operator_id` int(10) unsigned DEFAULT '0' COMMENT '操作者',
    // `coin_amount` decimal(20,8) unsigned DEFAULT '0.00000000' COMMENT '购买数量',
    // `coin_type` varchar(20) DEFAULT '0.00000000' COMMENT '购买币类型',
    // `platform_coin_amount` decimal(20,8) unsigned DEFAULT '0.00000000' COMMENT '平台币数量',
    // `platform_coin_type` varchar(255) DEFAULT NULL COMMENT '平台币类型',
    // `notes` varchar(255) DEFAULT '' COMMENT '备注',
    // `action` enum('sub','add') DEFAULT 'add' COMMENT '加减',
    // `create_datetime` timestamp NULL DEFAULT NULL COMMENT '创建时间',
    // `update_datetime` timestamp NULL DEFAULT NULL COMMENT '更新时间',

    async addLog(user_id, operator_id, coin_amount, coin_type, platform_coin_amount, platform_coin_type, notes, action) {
        const create_datetime = utils99.Time()
        const update_datetime = utils99.Time()
        const res = await db.Query("INSERT INTO currency_platform_buy_log(user_id, operator_id, coin_amount, coin_type, platform_coin_amount, platform_coin_type, notes, action, create_datetime, update_datetime) VALUES(?,?,?,?,?,?,?,?,?,?)", [user_id, operator_id, coin_amount, coin_type, platform_coin_amount, platform_coin_type, notes, action, create_datetime, update_datetime])
        return res
    }
}

module.exports = _t