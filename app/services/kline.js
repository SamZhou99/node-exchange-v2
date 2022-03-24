const fs = require('fs');
const utils99 = require('node-utils99')
const ktFormat = require('../../lib/kline.time.format.js')
const service_kline_history = require('./kline_history.js')

async function getHuobiApiKline(symbol, period, size) {
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
            let res = await service_kline_history.listBySymbol(symbol, period, size)
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
        if (size > 5) {
            fs.writeFileSync(filePath, JSON.stringify(klineRes))
        }
        return klineRes
    },
    contract: {
        async get(symbol, period, size) {
            `{
                "ch": "market.btcusdt.kline.1day",
                "status": "ok",
                "ts": 1647880874997,
                "data": [
                  {
                    "id": 1647878400,
                    "open": 41220.79,
                    "close": 40863.54,
                    "low": 40820.43,
                    "high": 41238.04,
                    "amount": 608.4297404903463,
                    "vol": 24982904.72071681,
                    "count": 47117
                  },
                ]
              }`
        }
    },
    platform: {
        async get(symbol, period, size) {
            `{
                "ch": "market.btcusdt.kline.1day",
                "status": "ok",
                "ts": 1647880874997,
                "data": [
                  {
                    "id": 1647878400,
                    "open": 41220.79,
                    "close": 40863.54,
                    "low": 40820.43,
                    "high": 41238.04,
                    "amount": 608.4297404903463,
                    "vol": 24982904.72071681,
                    "count": 47117
                  },
                ]
              }`
        }
    }
}


module.exports = _t