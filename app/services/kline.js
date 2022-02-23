const fs = require('fs');
const utils99 = require('node-utils99')
// const { db } = require('../../lib/db.setup.js')

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

module.exports = {
    async get(symbol = 'btcusdt', period = '1day', size = '500') {
        const DATE = utils99.moment().utcOffset(480).format('YYYYMMDD')
        let filePath = __dirname + `/../../public/kline/${symbol}-${DATE}-${period}.json`
        console.log('K线图文件路径：', filePath);
        if (fs.existsSync(filePath)) {
            let res = fs.readFileSync(filePath)
            return JSON.parse(res.toString())
        }

        const klineRes = await huobiApiKline(symbol, period, size)
        fs.writeFileSync(filePath, JSON.stringify(klineRes))
        return klineRes
    },
}