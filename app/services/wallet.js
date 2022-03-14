const utils99 = require('node-utils99')
const { db } = require('../../lib/db.setup.js')

let _t = {
    // 查询一个账户所有币
    async list(user_id) {
        const res = await db.Query("SELECT * FROM member_wallet WHERE user_id=?", [user_id])
        return res
    },
    // 查询一个账户的币种
    async oneByCoinName(user_id, coinName) {
        const res = await db.Query("SELECT * FROM member_wallet WHERE user_id=? AND name=?", [user_id, coinName])
        return res.length > 0 ? res[0] : null
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
    // 同时更新资产和合约账户
    async updateAssetsAndContract(user_id, coinName, assetsAmount, contractAmount) {
        const res = await db.Query("UPDATE member_wallet SET assets_amount=?, contract_amount=? WHERE user_id=? AND name=?", [assetsAmount, contractAmount, user_id, coinName])
        return res
    }

}
module.exports = _t