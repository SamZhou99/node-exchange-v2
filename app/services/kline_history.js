const fs = require('fs');
const utils99 = require('node-utils99')
const config = require('../../config/all.js')
const ktFormat = require('../../lib/kline.time.format.js')
const { db } = require('../../lib/db.setup.js')

const service_currency_platform = require('../services/currency_platform.js');
const service_currency_contract = require('../services/currency_contract.js');

async function delay(time) {
    return new Promise((res, rej) => {
        setTimeout(() => {
            res()
        }, time)
    })
}

async function insert(symbol, period, open, close, high, low, vol, ts) {
    const create_datetime = utils99.Time(config.web.timezone)
    const update_datetime = utils99.Time(config.web.timezone)
    const res = await db.Query("INSERT INTO kline_history(`symbol`,`period`,`open`,`close`,`high`,`low`,`vol`,`ts`,`create_datetime`,`update_datetime`) VALUES(?,?,?,?,?,?,?,?,?,?)", [symbol, period, open, close, high, low, vol, ts, create_datetime, update_datetime])
    return res
}

async function one(symbol, period, ts) {
    const res = await db.Query("SELECT * FROM kline_history WHERE symbol=? AND period=? AND ts=? LIMIT 1", [symbol, period, ts])
    return res.length > 0 ? res : null
}

async function saveKlineArr(symbol, period, klineArr) {
    console.log("============>", symbol, period, klineArr.length)
    for (let i = 0; i < klineArr.length; i++) {
        let item = klineArr[i]
        await _t.update(symbol, period, item.open, item.close, item.high, item.low, item.volume, utils99.moment(item.timestamp).format("YYYY/MM/DD HH:mm:ss"))
        // console.log(i, ":", item.open, item.close, item.high, item.low, item.volume, utils99.moment(item.timestamp).format("YYYY/MM/DD HH:mm:ss"))
        console.log(i)
    }
}

function getKlineArr(lastObj, tsStep, length) {
    const TSSTEP = tsStep || 1000 * 60 // 间隔多少毫秒
    const LENGTH = length || 60 * 24 // 一天有多少分钟
    const OPEN = lastObj.open
    const CLOSE = lastObj.close
    const HIGH = lastObj.high
    const LOW = lastObj.low
    const TIMESTAMP = new Date(lastObj.timestamp).getTime()

    const TEMP = (CLOSE - OPEN) / LENGTH

    // let isUp = random(0, 10) > 4
    let isUp = true
    let open = OPEN
    let close = isUp ? open + TEMP : open - TEMP
    let high = Math.max(open, close)
    let low = Math.min(open, close)
    let volume = Math.abs(high - low) * 1000 * Math.random()
    let timestamp = TIMESTAMP

    let a = []
    for (let i = 1; i <= LENGTH; i++) {
        a.push({ open, close, high, low, volume, timestamp })

        // isUp = random(0, 10) > 4
        open = close
        close = isUp ? open + TEMP : open - TEMP
        high = Math.max(open + 0.01, close + 0.01)
        low = Math.min(open - 0.01, close - 0.01)
        volume = Math.abs(high - low) * 1000 * Math.random()
        timestamp += TSSTEP
    }
    return a
}





let _t = {
    /**
     * 按符号查询历史
     * @param {*} symbol 符号
     * @param {*} period 时段
     * @param {*} size 多少
     * @param {*} isCurrTime 是否，只输出，当前时间以前的数据
     * @returns 
     */
    async listBySymbol(symbol, period, size, isCurrTime = true) {
        if (isCurrTime) {
            const ts = utils99.Time(config.web.timezone)
            let res = db.Query("SELECT * FROM kline_history WHERE symbol=? AND period=? AND ts<=? ORDER BY ts DESC LIMIT ?", [symbol, period, ts, size])
            return res
        }
        let res = db.Query("SELECT * FROM kline_history WHERE symbol=? AND period=? ORDER BY ts DESC LIMIT ?", [symbol, period, size])
        return res
    },

    async update(symbol, period, open, close, high, low, vol, ts) {
        let checkRes = await one(symbol, period, ts)
        if (checkRes == null) {
            console.log("INSERT")
            let insertRes = await insert(symbol, period, open, close, high, low, vol, ts)
            return insertRes
        }
        console.log("UPDATE")
        const update_datetime = utils99.Time(config.web.timezone)
        const updateRes = await db.Query("UPDATE kline_history SET `symbol`=?,`period`=?,`open`=?,`close`=?,`high`=?,`low`=?,`vol`=?,`ts`=?,`update_datetime`=? WHERE `symbol`=? AND `period`=? AND `ts`=?", [symbol, period, open, close, high, low, vol, ts, update_datetime, symbol, period, ts])
        return updateRes
    },

    // 请求历史数据时，分类，法币，平台币，合约币
    async getSymbolType(symbol) {
        if (symbol.toLowerCase().indexOf("usdt") != -1) {
            let res
            let sy = symbol.substring(0, symbol.length - 4)
            res = await service_currency_platform.oneBySymbol(sy)
            if (res != null) {
                return "platform"
            }
            res = await service_currency_contract.oneBySymbol(sy)
            if (res != null) {
                return "contract"
            }
        }
        return ""
    },

    // 后台添加数据时，生成其他时刻的数据
    async updateAllData(symbol, period, kline) {
        let a = kline
        let len = a.length
        for (let i = 0; i < len; i++) {
            const item = a[i]
            // 1day
            await _t.update(symbol, period, item.open, item.close, item.high, item.low, item.volume, item.timestamp)
            // 4hour
            await saveKlineArr(symbol, "4hour", getKlineArr(item, 1000 * 60 * 240, 60 * 24 / 240))
            // 60min
            await saveKlineArr(symbol, "60min", getKlineArr(item, 1000 * 60 * 60, 60 * 24 / 60))
            // 30min
            await saveKlineArr(symbol, "30min", getKlineArr(item, 1000 * 60 * 30, 60 * 24 / 30))
            // 15min
            await saveKlineArr(symbol, "15min", getKlineArr(item, 1000 * 60 * 15, 60 * 24 / 15))
            // 5min
            await saveKlineArr(symbol, "5min", getKlineArr(item, 1000 * 60 * 5, 60 * 24 / 5))
            // 1min
            await saveKlineArr(symbol, "1min", getKlineArr(item, 1000 * 60, 60 * 24))
        }

        return true
    },

    // 更新平台币名称
    async updateNameByName(old_name, new_name) {
        const res = await db.Query("UPDATE kline_history SET `symbol`=? WHERE `symbol`=?", [new_name, old_name])
        return res
    },

    // 清除历史记录 
    async clearHistoryBySymbol(symbol) {
        const res = await db.Query("DELETE FROM kline_history WHERE symbol=?", [symbol])
        return res
    }
}


module.exports = _t