const utils99 = require('node-utils99')
const { db } = require('../../lib/db.setup.js')
const config = require('../../config/all.js')


async function oneByAddress(address) {
    let res = await db.Query('SELECT * FROM system_wallet_address WHERE address=? LIMIT 1', [address])
    return res.length > 0 ? res : null;
}

async function addAddress(upload_user_id, bind_user_id, address, type) {
    const create_datetime = utils99.Time(config.web.timezone)
    const update_datetime = utils99.Time(config.web.timezone)
    const res = await db.Query(`INSERT INTO system_wallet_address (upload_user_id,bind_user_id,address,type,create_datetime,update_datetime) VALUES (?,?,?,?,?,?)`, [upload_user_id, bind_user_id, address, type, create_datetime, update_datetime])
    return res
}

function getWalletType(wallet_address) {
    // ETH
    if (wallet_address.substr(0, 2) == "0x") {
        return config.common.coin.type.ETH
    }
    // USDT-TRC20
    if (wallet_address.substr(0, 1) == "T") {
        return config.common.coin.type.USDT
    }
    // BTC
    if (
        // 普通地址
        wallet_address.substr(0, 1) == "1"
        // 隔离验证(兼容)
        || wallet_address.substr(0, 1) == "3"
        // 隔离验证(原生) Taproot地址
        || wallet_address.substr(0, 3) == "bc1"
    ) {
        return config.common.coin.type.BTC
    }
    return null
}





let _t = {
    async importWalletAddress(list) {
        let results = {
            // 总数
            total: list.length,
            // 不合格的数据
            unqualified: 0,
            unqualifiedArr: [],
            // 已存在的数据
            exist: 0,
            // 导入成功的数据
            success: 0,
        }
        for (let i = 0; i < list.length; i++) {
            let item = list[i]

            if (item == undefined) continue
            if (item == null) continue
            // 去掉两边空格
            item = item.trim()
            // 大于20个字符长度 过滤一些特殊符号
            if (item.length < 20
                || item.indexOf(" ") != -1
                || item.indexOf(":") != -1
                || item.indexOf("-") != -1
                || item.indexOf("\n") != -1
                || item.indexOf("\r") != -1
                || item.indexOf("\t") != -1
            ) {
                results.unqualified++
                results.unqualifiedArr.push(item)
                continue;
            }

            // @todo: upload_user_id 这个要从接口获取
            let upload_user_id = 1
            let bind_user_id = 0
            let wallet_address = item
            let wallet_type = getWalletType(wallet_address)
            // 过滤掉 不满足钱包特征
            if (wallet_type == null) {
                results.unqualified++
                results.unqualifiedArr.push(item)
                continue;
            }

            // 检查 地址 是否有重复
            let res = await oneByAddress(item)
            if (res != null) {
                results.exist++
                continue
            }

            await addAddress(upload_user_id, bind_user_id, wallet_address, wallet_type)
            results.success++
        }
        return results
    },
    async list(address, type, start, length) {
        if (address) {
            let res = await db.Query("SELECT COUNT(0) AS total FROM system_wallet_address WHERE address=?", address)
            let total = res[0]['total']
            let list = await db.Query("SELECT * FROM system_wallet_address WHERE address=? ORDER BY id DESC LIMIT ?,?", [address, start, length])
            return { total, list }
        }
        let res = await db.Query("SELECT COUNT(0) AS total FROM system_wallet_address")
        let total = res[0]['total']
        let list = await db.Query("SELECT * FROM system_wallet_address ORDER BY id DESC LIMIT ?,?", [start, length])
        return { total, list }
    },
    // 自动完成
    async listByAddress(address, limit) {
        const list = await db.Query("SELECT id,address FROM system_wallet_address WHERE address LIKE ? ORDER BY id DESC LIMIT ?", [`%${address}%`, limit])
        return list
    },
    /**
     * 是/否? 可以绑定钱包地址?
     * @param {*} user_id 
     * @returns true=可以绑定，false=不可以绑定
     */
    async isCanBindAddress(user_id) {
        const BtcRes = await db.Query("SELECT id FROM system_wallet_address WHERE bind_user_id=? AND type=? LIMIT 1", [user_id, 'btc'])
        if (BtcRes.length > 0) return false
        const EthRes = await db.Query("SELECT id FROM system_wallet_address WHERE bind_user_id=? AND type=? LIMIT 1", [user_id, 'eth'])
        if (EthRes.length > 0) return false
        const UsdtRes = await db.Query("SELECT id FROM system_wallet_address WHERE bind_user_id=? AND type=? LIMIT 1", [user_id, 'usdt'])
        if (UsdtRes.length > 0) return false
        return true
    },
    /**
     * 有没有未使用的地址（检查system_wallet_address表）（三个地址为一组：btc,eth,usdt）
     * @returns true=有剩余地址，flash=没有剩余
     */
    async isUnusedAddress() {
        const BtcRes = await db.Query("SELECT id FROM system_wallet_address WHERE bind_user_id=? AND type=? LIMIT 1", [0, 'btc'])
        if (BtcRes.length <= 0) return false
        const EthRes = await db.Query("SELECT id FROM system_wallet_address WHERE bind_user_id=? AND type=? LIMIT 1", [0, 'eth'])
        if (EthRes.length <= 0) return false
        const UsdtRes = await db.Query("SELECT id FROM system_wallet_address WHERE bind_user_id=? AND type=? LIMIT 1", [0, 'usdt'])
        if (UsdtRes.length <= 0) return false
        return true
    },
    // 未使用的钱包地址 随机取一条 并 绑定给用户
    async bindWalletAddressByUserId(user_id, coin_type) {
        const res = await db.Query("SELECT * FROM system_wallet_address WHERE type=? AND bind_user_id=0 ORDER BY RAND() LIMIT 1", [coin_type])
        if (res.length <= 0) {
            return null;
        }
        // 绑定用户ID
        const id = res[0].id
        await db.Query("UPDATE system_wallet_address SET bind_user_id=? WHERE id=?", [user_id, id])

        return res[0]
    },
    // 解除 某用户绑定的钱包地址
    async unbindByUserId(user_id) {
        const res = await db.Query("UPDATE system_wallet_address SET bind_user_id=0 WHERE bind_user_id=?", [user_id])
        return res
    },
    // 币 总数 和 使用数
    async walletUseTotal(type) {
        const total_res = await db.Query("SELECT COUNT(0) AS total FROM system_wallet_address WHERE type=?", [type])
        const total = total_res[0]['total']
        const use_res = await db.Query("SELECT COUNT(0) AS total FROM system_wallet_address WHERE type=? AND bind_user_id>0 ", [type])
        const use = use_res[0]['total']
        return { total, use }
    },
    async walletUseTotalByAgentId(agent_id, type) {
        const total_res = await db.Query("SELECT COUNT(0) AS total FROM system_wallet_address WHERE type=? AND bind_user_id IN (SELECT id FROM member_list WHERE agent_id=?)", [type, agent_id])
        const total = total_res[0]['total']
        const use_res = await db.Query("SELECT COUNT(0) AS total FROM system_wallet_address WHERE type=? AND bind_user_id>0 AND bind_user_id IN (SELECT id FROM member_list WHERE agent_id=?)", [type, agent_id])
        const use = use_res[0]['total']
        return { total, use }
    },
}

module.exports = _t