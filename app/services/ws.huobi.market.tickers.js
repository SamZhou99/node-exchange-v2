const utils99 = require('node-utils99')
const config = require('../../config/all.js')
const service_caches = require('./caches.js')

let _t = {
    name: 'HuoBi API',
    callback: null,
    getMarketCoinExists(arr, symbol) {
        const a = arr
        for (let i = 0; i < a.length; i++) {
            if (a[i].symbol == symbol) {
                return a[i]
            }
        }
        return null
    },
    async initMarketTickers() {
        // const url = 'https://api.huobi.pro/market/tickers'
        const url = 'http://api.huobi.pro/market/tickers'
        const res = await utils99.request.axios.get({ url: url, headers: utils99.request.HEADERS.pc, isDebug: false }).catch(err => {
            console.error(err)
        })
        if (!res) {
            setTimeout(async () => {
                await _t.initMarketTickers()
            }, 5000)
            return
        }

        let arrayData = []
        const key = "huobi-market-tickers"
        let jsonData = null
        const a = config.common.coin.need
        for (let i = 0; i < a.length; i++) {
            let item
            if (item = _t.getMarketCoinExists(res.data.data, a[i] + 'usdt')) {
                item.name = a[i]
                arrayData.push(item)
            }
        }
        jsonData = JSON.stringify(arrayData)
        await service_caches.set(key, jsonData)
        // console.log(key, jsonData.length)
        if (_t.callback) {
            _t.callback({ key, value: arrayData })
        }

        setTimeout(async () => {
            await _t.initMarketTickers()
        }, 10000)
    },
    async init() {
        this.initMarketTickers()
    }
}



if (require.main === module) {
    _t.init()
}

module.exports = _t