const utils99 = require('node-utils99')
const { db } = require('../../lib/db.setup.js')

let _t = {
    async init_web(user_id) {
        await db.Query('TRUNCATE `currency_contract`')
        await db.Query('TRUNCATE `currency_contract_trade_log`')

        await db.Query('TRUNCATE `currency_platform`')
        await db.Query('TRUNCATE `currency_platform_trade_log`')

        await db.Query('TRUNCATE `login_log`')
        await db.Query('TRUNCATE `member_auth`')
        await db.Query('TRUNCATE `member_auth_photo`')
        await db.Query('TRUNCATE `member_list`')
        await db.Query('TRUNCATE `member_transfer_log`')
        await db.Query('TRUNCATE `member_wallet`')
        await db.Query('TRUNCATE `member_wallet_log`')
        await db.Query('TRUNCATE `member_withdraw_log`')
        await db.Query('TRUNCATE `system_session`')
        await db.Query('TRUNCATE `system_wallet_address`')
        return true
    },
    async init_admin(user_id) {
        await db.Query('TRUNCATE `admin_list`')
        await db.Query("INSERT INTO `admin_list` VALUES ('1', 'admin', '21232f297a57a5a743894a0e4a801fc3', 'admin', '管理员', '0', '1', '2022-04-02 21:49:47', '2022-04-20 15:52:29');")
        
        await db.Query('TRUNCATE `agent_list`')
        return true
    },
}
module.exports = _t