const CronJob = require('cron').CronJob;
const utils99 = require('node-utils99');
// const { connection } = require('websocket');
const { db } = require('../../../lib/db.setup.js')

async function huobiApiKline(symbol, period, size) {
    // 火币API https://huobiapi.github.io/docs/spot/v1/en/#get-klines-candles
    // period: 1min, 5min, 15min, 30min, 60min, 4hour, 1day, 1mon, 1week, 1year
    // https://api.hadax.com/market/history/kline?period=1day&size=10&symbol=btcusdt
    const URL = `https://api.hadax.com/market/history/kline?period=${period}&size=${size}&symbol=${symbol}`

    let httpRes = await utils99.request.axios.get({ url: URL, headers: utils99.request.HEADERS.mobile }).catch(err => {
        console.log('请求异常', URL, err)
    })

    if (httpRes && httpRes.statusText == 'OK') {
        return httpRes.data
    }

    return null
}

function getSize(symbol, period) {
    return 365
}

function getList(res, symbol, period, size) {
    if (!res) {
        console.log('res', res)
        return null
    }
    if (!res.data) {
        console.log('res.data', res.data)
        return null
    }
    let resultArr = []
    let a = res.data.reverse()
    for (let i = 0; i < a.length; i++) {
        let item = {
            symbol: symbol,
            period: period,
            open: a[i].open,
            close: a[i].close,
            high: a[i].high,
            low: a[i].low,
            vol: a[i].vol,
            ts: utils99.Timestamp(Number(a[i].id) * 1000),
        }
        resultArr.push(item)
    }
    return resultArr
}

async function selectData(symbol, period, ts) {
    const res = await db.Query("SELECT * FROM kline_history WHERE symbol=? AND period=? AND ts=? LIMIT 1", [symbol, period, ts])
    return res.length > 0 ? res : null
}

async function insertData(symbol, period, open, close, high, low, vol, ts) {
    const create_datetime = utils99.Time()
    const update_datetime = utils99.Time()
    const res = await db.Query("INSERT INTO kline_history(`symbol`,`period`,`open`,`close`,`high`,`low`,`vol`,`ts`,`create_datetime`,`update_datetime`) VALUES(?,?,?,?,?,?,?,?,?,?)", [symbol, period, open, close, high, low, vol, ts, create_datetime, update_datetime])
    return res
}

async function updateData(symbol, period, open, close, high, low, vol, ts) {
    let checkRes = await selectData(symbol, period, ts)
    if (checkRes == null) {
        let insertRes = await insertData(symbol, period, open, close, high, low, vol, ts)
        return insertRes
    }
    const update_datetime = utils99.Time()
    const updateRes = await db.Query("UPDATE kline_history SET `symbol`=?,`period`=?,`open`=?,`close`=?,`high`=?,`low`=?,`vol`=?,`ts`=?,`update_datetime`=? WHERE `symbol`=? AND `period`=? AND `ts`=?", [symbol, period, open, close, high, low, vol, ts, update_datetime, symbol, period, ts])
    return updateRes
}

async function delay(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}

let CronArr = []
function initCronJob(callback) {
    const m1 = new CronJob("0 * * * * *", function () {
        if (callback) {
            callback("1min");
        }
    })
    CronArr.push(m1);

    const m5 = new CronJob("0 0/5 * * * *", function () {
        if (callback) {
            callback("5min");
        }
    })
    CronArr.push(m5);

    const m15 = new CronJob("0 0/15 * * * *", function () {
        if (callback) {
            callback("15min");
        }
    })
    CronArr.push(m15);

    const m30 = new CronJob("0 0/30 * * * *", function () {
        if (callback) {
            callback("30min");
        }
    })
    CronArr.push(m30);

    const h1 = new CronJob("0 0 0/1 * * *", function () {
        if (callback) {
            callback("1h");
        }
    })
    CronArr.push(h1);

    const h4 = new CronJob("0 0 0/4 * * *", function () {
        if (callback) {
            callback("4h");
        }
    })
    CronArr.push(h4);

    const d1 = new CronJob("0 0 0 1/1 * *", function () {
        if (callback) {
            callback("1d");
        }
    })
    CronArr.push(d1);

    for (let i = 0; i < CronArr.length; i++) {
        let item = CronArr[i]
        item.start()
    }
}

let _t = {
    async init(symbol = "btcusdt") {
        // const symbol = "btcusdt"
        const periods = [
            '1min',
            '5min',
            '15min',
            '30min',
            '60min',
            '4hour',
            '1day',
            // '1week', 
            // '1mon', 
            // '1year'
        ]
        for (let index = 0; index < periods.length; index++) {
            const period = periods[index]
            const size = getSize(symbol, period)
            const res = await huobiApiKline(symbol, period, size)
            console.log(period, size, res)
            if (res && res.data != undefined) {
                let a = getList(res, symbol, period, size)
                for (let i = 0; i < a.length; i++) {
                    let it = a[i]
                    await updateData(it.symbol, it.period, it.open, it.close, it.high, it.low, it.vol, it.ts)
                }
                console.log("insert", symbol, period, size, a.length)
            }
            await delay(1000)
        }

        initCronJob(async (period) => {
            let size = 2
            let res = await huobiApiKline(symbol, period, size)
            if (res && res.data != undefined) {
                let a = getList(res, symbol, period, size)
                for (let i = 0; i < a.length; i++) {
                    let it = a[i]
                    await updateData(it.symbol, it.period, it.open, it.close, it.high, it.low, it.vol, it.ts)
                    console.log("update", symbol, period, size, a.length)
                }
            }
        })
    },
}


if (require.main === module) {
    _t.init("btcusdt")
}

module.exports = _t;