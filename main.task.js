const task = require('./app/services/task/kline.js')

async function init() {
    await task.init("btcusdt")
}

init()