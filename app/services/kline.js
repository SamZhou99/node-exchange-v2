const fs = require('fs');
const utils99 = require('node-utils99')
const ktFormat = require('../../lib/kline.time.format.js')
const service_kline_history = require('./kline_history.js')

async function getHuobiApiKline(symbol, period, size) {
    // 火币API https://huobiapi.github.io/docs/spot/v1/en/#get-klines-candles
    // period: 1min, 5min, 15min, 30min, 60min, 4hour, 1day, 1mon, 1week, 1year
    // https://api.hadax.com/market/history/kline?period=1day&size=10&symbol=btcusdt
    // const URL = `https://api.hadax.com/market/history/kline?period=${period}&size=${size}&symbol=${symbol}`
    // const URL = `http://api.hadax.com/market/history/kline?period=${period}&size=${size}&symbol=${symbol}`
    const URL = `https://api.huobi.pro/market/history/kline?period=${period}&size=${size}&symbol=${symbol}`
    console.log(URL)
    let httpRes = await utils99.request.axios.get({ url: URL, headers: utils99.request.HEADERS.mobile }).catch(err => {
        console.log('请求异常', URL, err)
    })

    if (httpRes && httpRes.statusText == 'OK') {
        return httpRes.data
    }

    return null
}

function getJsonFilePath(symbol, period) {
    // 1min, 5min, 15min, 30min, 60min, 4hour, 1day, 1mon, 1week, 1year
    const date = ktFormat.getDateTimeFormat(period)
    const path = __dirname + `/../../public/kline/${symbol}-${date}-${period}.json`
    console.log('K线图文件路径：', path)
    return path
}

let _t = {
    async get(symbol = 'btcusdt', period = '1day', size = 365) {
        if (symbol == 'btcusdt') {
            let res = await service_kline_history.listBySymbol(symbol, period, size, true)
            // console.log(res, symbol, period, size)
            return {
                "ch": `market.${symbol} .kline.${period} `,
                "status": "ok",
                "ts": Date.now(),
                "data": res
            }
        }

        let filePath = getJsonFilePath(symbol, period)

        if (fs.existsSync(filePath)) {
            let res = fs.readFileSync(filePath)
            return JSON.parse(res.toString())
        }

        const klineRes = await getHuobiApiKline(symbol, period, size)
        if (size > 5 && klineRes != null) {
            fs.writeFileSync(filePath, JSON.stringify(klineRes))
        }
        return klineRes
    },
    contract: {
        async get(symbol, period, size, isCurrTime) {
            let res = await service_kline_history.listBySymbol(symbol, period, size, isCurrTime)
            if (period != '1min') {
                let list_1min = await service_kline_history.listBySymbol(symbol, '1min', 1, isCurrTime)
                if (list_1min.length > 0) {
                    if (res[0].open < res[0].close) {
                        res[0].close = list_1min[0].close
                        res[0].high = list_1min[0].close
                    } else {
                        res[0].close = list_1min[0].close
                        res[0].low = list_1min[0].close
                    }
                }
            }
            let ts = new Date().getTime()
            return {
                "type": "contract",
                "ch": `market.${symbol}.kline.${period}`,
                "status": "ok",
                "ts": ts,
                "data": res
            }
        }
    },
    platform: {
        async get(symbol, period, size, isCurrTime) {
            let res = await service_kline_history.listBySymbol(symbol, period, size, isCurrTime)
            if (period != '1min' && isCurrTime) {
                let list_1min = await service_kline_history.listBySymbol(symbol, '1min', 1, isCurrTime)
                if (list_1min.length > 0) {
                    if (res[0].open < res[0].close) {
                        res[0].close = list_1min[0].close
                        res[0].high = list_1min[0].close
                    } else {
                        res[0].close = list_1min[0].close
                        res[0].low = list_1min[0].close
                    }
                }
            }
            let ts = new Date().getTime()
            return {
                "type": "platform",
                "ch": `market.${symbol}.kline.${period}`,
                "status": "ok",
                "ts": ts,
                "data": res
            }
        }
    }
}


module.exports = _t