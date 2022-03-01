const fs = require('fs');
const utils99 = require('node-utils99')
const ktFormat = require('../../lib/kline.time.format.js')

async function huobiApiKline(symbol, period, size) {
    // 火币API https://huobiapi.github.io/docs/spot/v1/en/#get-klines-candles
    // period: 1min, 5min, 15min, 30min, 60min, 4hour, 1day, 1mon, 1week, 1year
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
    async get(symbol = 'btcusdt', period = '1day', size = '500') {

        let filePath = getJsonFilePath(symbol, period)

        if (fs.existsSync(filePath)) {
            let res = fs.readFileSync(filePath)
            return JSON.parse(res.toString())
        }

        const klineRes = await huobiApiKline(symbol, period, size)
        fs.writeFileSync(filePath, JSON.stringify(klineRes))
        return klineRes
    },
}


module.exports = _t