const utils99 = require('node-utils99')
const { db } = require('../../lib/db.setup.js')

let _t = {
    async set(key, value) {
        let getRes = await _t.get(key)
        let create_datetime = utils99.Time()
        let update_datetime = utils99.Time()
        let setRes
        if (getRes) {
            setRes = await db.Query('UPDATE `caches` SET `value`=?, update_datetime=? WHERE `key`=?', [value, update_datetime, key])
            return
        }
        setRes = await db.Query('INSERT INTO `caches` (`key`,`value`,create_datetime,update_datetime) VALUES (?,?,?,?)', [key, value, create_datetime, update_datetime])
        return setRes
    },
    async get(key) {
        let res = await db.Query('SELECT * FROM `caches` WHERE `key`=? LIMIT 1', [key])
        return res.length > 0 ? res[0] : null
    },
    async del(key) {
        let res = await db.Query('DELETE FROM `caches` WHERE `key`=?', [key])
        return res
    },
}
module.exports = _t