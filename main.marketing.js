const service_ws_huobi = require('./app/services/ws.huobi.js')
const service_http_huobi = require('./app/services/ws.huobi.market.tickers.js')

// const service_ws_binance = require('./app/services/ws.binance.tickers.js')


async function init() {
    service_ws_huobi.callback = (value) => {
        console.log(value)
    }
    await service_ws_huobi.init()

    // service_http_huobi.callback = (value) => {
    //     console.log(value.value.length)
    // }
    // await service_http_huobi.init()

    // service_ws_binance.callback = (value) => {
    //     console.log(value)
    // }
    // await service_ws_binance.init()
}


init()