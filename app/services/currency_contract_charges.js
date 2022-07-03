// const utils99 = require('node-utils99')
// const config = require('../../config/all.js');
const { db } = require('../../lib/db.setup.js')

let _t = {
    // 查询
    async oneById(id) {
        let res = await db.Query("SELECT * FROM currency_contract_charges WHERE id=? LIMIT 1", [id])
        return res.length > 0 ? res[0] : null
    },
    // 查询 通过符号
    async oneByName(label) {
        let res = await db.Query("SELECT * FROM currency_contract_charges WHERE label=? LIMIT 1", [label])
        return res.length > 0 ? res[0] : null
    },
    // 登录日志列表
    async list() {
        let res = await db.Query("SELECT * FROM currency_contract_charges", [])
        return res
    },
    // 增加
    async add(label, charge, minLots) {
        const res = await db.Query("INSERT INTO currency_contract_charges(`label`, `charge`, `min_lots`) VALUES(?,?,?)", [label, charge, minLots])
        return res
    },
    // 更新
    async update(id, label, charge, minLots) {
        const res = await db.Query("UPDATE currency_contract_charges SET `label`=?, `charge`=?, `min_lots`=? WHERE id=?", [label, charge, minLots, id])
        return res
    }
}

module.exports = _t