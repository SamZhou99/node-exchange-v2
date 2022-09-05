const utils99 = require('node-utils99')
const config = require('../../config/all.js');
const { db } = require('../../lib/db.setup.js')

let _t = {
    // 查询
    async oneById(id) {
        let res = await db.Query("SELECT * FROM currency_contract_sec_charges WHERE id=?", [id])
        return res.length > 0 ? res[0] : null
    },
    // 列表
    async list(start, length) {
        let total = await db.Query("SELECT COUNT(0) AS total FROM currency_contract_sec_charges")
        total = total[0]['total']
        let list = await db.Query("SELECT * FROM currency_contract_sec_charges ORDER BY id DESC LIMIT ?,?", [start, length])
        return { total, list }
    },
    // 增加
    async add(sec, rate, min, charge) {
        const res = await db.Query("INSERT INTO currency_contract_sec_charges(`sec`, `rate`, `min`, `charge`) VALUES(?,?,?,?)", [sec, rate, min, charge])
        return res
    },
    // 更新
    async update(id, sec, rate, min, charge) {
        const res = await db.Query("UPDATE currency_contract_sec_charges SET `sec`=?, `rate`=?, `min`=?, `charge`=?, WHERE id=?", [sec, rate, min, charge, id])
        return res
    },
    // 删除
    async delete(id) {
        const res = await db.Query("DELETE FROM currency_contract_sec_charges WHERE id=?", [id])
        return res
    }
}

module.exports = _t