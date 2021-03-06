const utils99 = require('node-utils99')
const config = require('../../config/all.js')
const { db } = require('../../lib/db.setup.js')

let _t = {
    // 查询一个账户所有币
    async list(user_id) {
        const res = await db.Query("SELECT * FROM member_wallet WHERE user_id=?", [user_id])
        return res
    },
    // 查询一个账户 一种类型的币
    async listByType(user_id, type) {
        const res = await db.Query("SELECT * FROM member_wallet WHERE user_id=? AND type=?", [user_id, type])
        return res
    },
    // 查询一个账户的币种
    async oneByCoinName(user_id, coinName) {
        const res = await db.Query("SELECT * FROM member_wallet WHERE user_id=? AND name=?", [user_id, coinName])
        return res.length > 0 ? res[0] : null
    },
    // 为一个账户 添加一个钱包币种
    async addWallet(user_id, type, assets_amount, contract_amount, name, address) {
        const time = utils99.Time(config.web.timezone)
        const res = await db.Query("INSERT INTO member_wallet (`user_id`,`type`,`assets_amount`,`contract_amount`,`name`,`address`,`create_datetime`,`update_datetime`) VALUES (?,?,?,?,?,?,?,?)", [user_id, type, assets_amount, contract_amount, name, address, time, time])
        return res
    },
    // 更新资产账户数量
    async updateAssetsAmount(user_id, coinName, amount) {
        const res = await db.Query("UPDATE member_wallet SET assets_amount=? WHERE user_id=? AND name=?", [amount, user_id, coinName])
        return res
    },
    // 更新合约账户数量
    async updateContractAmount(user_id, coinName, amount) {
        const res = await db.Query("UPDATE member_wallet SET contract_amount=? WHERE user_id=? AND name=?", [amount, user_id, coinName])
        return res
    },
    async updateContractAmountAction(user_id, coinName, amount, action = "+") {
        const res = await db.Query(`UPDATE member_wallet SET contract_amount=contract_amount${action}? WHERE user_id=? AND name=?`, [amount, user_id, coinName])
        return res
    },
    // 同时更新资产和合约账户
    async updateAssetsAndContract(user_id, coinName, assetsAmount, contractAmount) {
        const res = await db.Query("UPDATE member_wallet SET assets_amount=?, contract_amount=? WHERE user_id=? AND name=?", [assetsAmount, contractAmount, user_id, coinName])
        return res
    },
    // 我的资产 上下分
    async updateAddSubAssetsAmount(user_id, coinName, amount, action = "+") {
        const res = await db.Query(`UPDATE member_wallet SET assets_amount=assets_amount${action}? WHERE user_id=? AND name=?`, [amount, user_id, coinName])
        return res
    },
    // 更新平台币名称
    async updateNameByName(old_name, new_name) {
        const res = await db.Query("UPDATE member_wallet SET `name`=? WHERE `name`=?", [new_name, old_name])
        return res
    },

    // 解决绑定钱包地址，清空使用
    async updateWalletAddressByUserId(user_id) {
        const res = await db.Query("UPDATE member_wallet SET `address`='' WHERE `user_id`=?", [user_id])
        return res
    },
    async updateWallerAddressByUserIdCoin(user_id, btc_address, eth_address, usdt_address) {
        await db.Query("UPDATE member_wallet SET `address`=? WHERE `user_id`=? AND `name`=?", [btc_address, user_id, 'btc'])
        await db.Query("UPDATE member_wallet SET `address`=? WHERE `user_id`=? AND `name`=?", [eth_address, user_id, 'eth'])
        await db.Query("UPDATE member_wallet SET `address`=? WHERE `user_id`=? AND `name`=?", [usdt_address, user_id, 'usdt'])
        return true
    },
}
module.exports = _t