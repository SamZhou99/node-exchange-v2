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
        // console.log(i)
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

function getKlineTimeArr(arr, step) {
    let a = []
    let o
    for (let i = 0; i < arr.length; i++) {
        let item = arr[i]

        if (i % step == 0) {
            o = {
                open: 0,
                close: 0,
                high: 0,
                low: 999999999,
                volume: 0,
                timestamp: 0,
            }
            o.open = item.open
            o.timestamp = item.timestamp
        }

        o.high = Math.max(o.high, item.high)
        o.low = Math.min(o.low, item.low)
        o.volume += item.volume

        if (i % step == step - 1) {
            o.close = item.close
            a.push(o)
        }
    }
    return a
}

function round(num, len = 2) {
    const z = '0000000000000000000000'
    const n = Number(1 + z.substring(0, len))
    return Math.round(num * n) / n
}

function random(min, max) {
    return min + (Math.random() * (max - min))
}

function klineDataDemo01(symbol, period, item, time_step) {
    const START_DATE_TIME = item.timestamp
    const PERIOD = period // 时间线 单位
    const TIME_STEP = time_step // 时间线 间隔
    const DATE_LENGTH = 60 * 24 // 时长

    const START_PRICE = item.open // 开盘价
    const CLOSE_PRICE = item.close // 收盘价
    const HIGH = item.high // 最高价
    const LOW = item.low // 最低价

    let rangeProb = 5
    let highPercent = START_PRICE / 100
    let lowPercent = START_PRICE / 100
    let ts = new Date(START_DATE_TIME).getTime()

    let isUp = random(1, 10) < rangeProb
    let open = Number(START_PRICE)
    let close = Number(isUp ? open + random(open / 10000, open / 1000) : open - random(open / 10000, open / 1000))
    // close = round(close, 8)
    let high = Math.max(open, close) + open * round(highPercent / 100, 4)
    let low = Math.min(open, close) - open * round(lowPercent / 100, 4)
    let vol = Math.floor(Math.abs(open - close) * 10000) + random(10000, 20000)

    let _high = 0
    let _low = 0

    let a = [];
    for (let i = 0; i < DATE_LENGTH; i++) {
        let item = {
            open: open,
            close: close,
            high: high,
            low: low,
            volume: vol,
            timestamp: ts,
            period: PERIOD
        }
        if (i + 1 == DATE_LENGTH) {
            // console.log("最后一条数据", close)
            item.close = CLOSE_PRICE
        }
        a.push(item)

        // 1day
        // ts += 1000 * 60 * 60 * 24

        ts += TIME_STEP
        let timePercent = round(i / DATE_LENGTH * 100, 2)
        isUp = random(1, 10) < rangeProb

        _high = Math.max(_high, item.high)
        _low = Math.min(_low, item.low)

        // 保证有 Low
        if (timePercent > 2 && timePercent < 4) {
            if (_low > LOW) {
                isUp = random(1, 10) < 2
            }
        }

        // 保证有 High
        if (timePercent > 89 && timePercent < 91) {
            if (_high < HIGH) {
                isUp = true
            }
        }

        // 保证到 收盘价
        if (timePercent > 95) {
            if (close < CLOSE_PRICE) {
                isUp = random(1, 10) < 8
            } else {
                isUp = false
            }
        }
        open = round(close)
        let temp
        if (isUp) {
            temp = open + random(open / 1000, open / 100)
            if (HIGH < temp) {
                close = open - random(open / 1000, open / 100)
                high = HIGH
                low = Math.min(open, close) - open * random(close / 1000, close / 100) / 100
                if (low < LOW) low = LOW
            } else {
                close = temp
                high = Math.max(open, close) + open * random(close / 1000, close / 100) / 100
                if (high > HIGH) high = HIGH
                low = Math.min(open, close) - open * random(close / 1000, close / 100) / 100
                if (low < LOW) low = LOW
            }
        } else {
            temp = open - random(open / 1000, open / 100)
            if (LOW > temp) {
                close = open + random(open / 1000, open / 100)
                high = Math.max(open, close) + open * random(close / 1000, close / 100) / 100
                if (high > HIGH) high = HIGH
                low = LOW
            } else {
                close = temp
                high = Math.max(open, close) + open * random(close / 1000, close / 100) / 100
                if (high > HIGH) high = HIGH
                low = Math.min(open, close) - open * random(close / 1000, close / 100) / 100
                if (low < LOW) low = LOW
            }
        }
        vol = Math.floor(Math.abs(open - close) * 10000) + random(10000, 20000)
        // console.log(round(i / DATE_LENGTH * 100, 2), utils99.moment(ts).format("HH:mm:ss"), close)
    }
    // this.klineData = a;
    // this.klineChart.applyNewData(this.klineData);
    return a
}

function klineDataDemo02(symbol, period, kline) {
    // 
}

function findList(arr, key) {
    let a = []
    for (let i = 0; i < arr.length; i++) {
        let item = arr[i]
        let arrItem = item.split('_')
        if (arrItem[0] == key) {
            a.push(item)
        }
    }
    return a
}

function oneRandomList(arr, path_dir) {
    let file_name = path_dir + '/' + arr[Math.floor(Math.random() * arr.length)]
    console.log(file_name)
    let res = fs.readFileSync(file_name)
    let json = JSON.parse(res)
    return json.list
}

function templateToKline(tempalteArr, dayItem) {
    let startPrice = dayItem.open
    let endPrice = dayItem.close
    let volumeAdd = 12345
    let volumeMultiple = 8000000 / startPrice

    // let t_high = templateData.high
    // let t_low = templateData.low
    let t_open = tempalteArr[0]
    let t_close = tempalteArr[tempalteArr.length - 1]

    // let _a = t_high - t_low
    let _b = -(t_close - t_open)
    let _c = endPrice - startPrice
    let _d = _b / _c

    let a = []
    let templateList = tempalteArr
    let len = templateList.length - 1
    let date = utils99.moment(dayItem.timestamp).format("YYYY-MM-DD 00:00:00")
    let timestamp = new Date(date).getTime()
    let open = startPrice
    let close = -templateList[0] / _d + startPrice
    let rh = random(Math.abs(open - close) * (1 / 50), Math.abs(open - close))
    let rl = random(Math.abs(open - close) * (1 / 50), Math.abs(open - close))
    let high = Math.max(open + rh, close + rh)
    let low = Math.min(open - rl, close - rl)

    let item = {
        open: open,
        close: close,
        high: high,
        low: low,
        volume: (Math.abs(open - close) * volumeMultiple) + volumeAdd,
        timestamp: timestamp,
    }
    a.push(item)

    for (let i = 1; i < len; i++) {
        timestamp += 60000
        open = close
        close = -templateList[i] / _d + startPrice
        let rh = random(Math.abs(open - close) * (1 / 50), Math.abs(open - close))
        let rl = random(Math.abs(open - close) * (1 / 50), Math.abs(open - close))
        high = Math.max(open + rh, close + rh)
        low = Math.min(open - rl, close - rl)

        let item = {
            open: open,
            close: close,
            high: high,
            low: low,
            volume: (Math.abs(open - close) * volumeMultiple) + volumeAdd,
            timestamp: timestamp,
        }
        a.push(item)
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
            // console.log("INSERT")
            let insertRes = await insert(symbol, period, open, close, high, low, vol, ts)
            return insertRes
        }
        // console.log("UPDATE")
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
    async updateAllData2(symbol, period, kline) {
        let a = kline
        let len = a.length
        for (let i = 0; i < len; i++) {
            const item = a[i]
            // 1day
            await _t.update(symbol, period, item.open, item.close, item.high, item.low, item.volume, item.timestamp)
            // // 4hour
            // await saveKlineArr(symbol, "4hour", getKlineArr(item, 1000 * 60 * 240, 60 * 24 / 240))
            // // 60min
            // await saveKlineArr(symbol, "60min", getKlineArr(item, 1000 * 60 * 60, 60 * 24 / 60))
            // // 30min
            // await saveKlineArr(symbol, "30min", getKlineArr(item, 1000 * 60 * 30, 60 * 24 / 30))
            // // 15min
            // await saveKlineArr(symbol, "15min", getKlineArr(item, 1000 * 60 * 15, 60 * 24 / 15))
            // // 5min
            // await saveKlineArr(symbol, "5min", getKlineArr(item, 1000 * 60 * 5, 60 * 24 / 5))
            // // 1min
            // await saveKlineArr(symbol, "1min", getKlineArr(item, 1000 * 60, 60 * 24))


            // 1min
            let oneMinArr = klineDataDemo01(symbol, '1min', item, 1000 * 60)
            await saveKlineArr(symbol, "1min", oneMinArr)
            // 5min
            let fiveMinArr = getKlineTimeArr(oneMinArr, 5)
            await saveKlineArr(symbol, "5min", fiveMinArr)
            // 15min
            let fifteenMinArr = getKlineTimeArr(fiveMinArr, 3)
            await saveKlineArr(symbol, "15min", fifteenMinArr)
            // 30min
            let thirtyMinArr = getKlineTimeArr(fifteenMinArr, 2)
            await saveKlineArr(symbol, "30min", thirtyMinArr)
            // 60min
            let sixtyMinArr = getKlineTimeArr(thirtyMinArr, 2)
            await saveKlineArr(symbol, "60min", sixtyMinArr)
            // 4hour
            let fourHourArr = getKlineTimeArr(sixtyMinArr, 4)
            await saveKlineArr(symbol, "4hour", fourHourArr)
        }

        return true
    },
    async updateAllData(symbol, period, kline) {
        console.log(symbol, period, kline.length)

        let dir_path = __dirname + `./../../public/kline-template`
        let dir_list = fs.readdirSync(dir_path)
        let up_list = findList(dir_list, 'up')
        let down_list = findList(dir_list, 'down')
        let kline_list = []

        for (let i = 0; i < kline.length; i++) {
            let day_item = kline[i]
            if (day_item.open < day_item.close) {
                kline_list = oneRandomList(up_list, dir_path)
            } else {
                kline_list = oneRandomList(down_list, dir_path)
            }
            let one_day_kline = templateToKline(kline_list, day_item)
            // console.log(one_day_kline)
            // continue

            // 1min
            let oneMinArr = one_day_kline
            await saveKlineArr(symbol, "1min", one_day_kline)
            // 5min
            let fiveMinArr = getKlineTimeArr(oneMinArr, 5)
            await saveKlineArr(symbol, "5min", fiveMinArr)
            // 15min
            let fifteenMinArr = getKlineTimeArr(fiveMinArr, 3)
            await saveKlineArr(symbol, "15min", fifteenMinArr)
            // 30min
            let thirtyMinArr = getKlineTimeArr(fifteenMinArr, 2)
            await saveKlineArr(symbol, "30min", thirtyMinArr)
            // 60min
            let sixtyMinArr = getKlineTimeArr(thirtyMinArr, 2)
            await saveKlineArr(symbol, "60min", sixtyMinArr)
            // 4hour
            let fourHourArr = getKlineTimeArr(sixtyMinArr, 4)
            await saveKlineArr(symbol, "4hour", fourHourArr)
            // 1day
            let oneDayArr = getKlineTimeArr(fourHourArr, 6)
            await saveKlineArr(symbol, "1day", oneDayArr)
        }


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