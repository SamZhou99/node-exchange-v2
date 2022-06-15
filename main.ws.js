const utils99 = require('node-utils99')
const config = require('./config/all.js')
const WebSocketServer = require('websocket').server
const http = require('http')

const service_currency_platform = require('./app/services/currency_platform.js')
const service_currency_contract = require('./app/services/currency_contract.js')
const service_kline_history = require('./app/services/kline_history.js')

const service_currency_contract_trade_log = require('./app/services/currency_contract_trade_log.js');

const service_wallet = require('./app/services/wallet.js')


function round(num, len) {
    let z = "000000000000000000000000000000";
    let zr = Number(1 + String(z).substring(0, len));
    return Math.round(Number(num) * zr) / zr
}



// 火币市场货币价格 缓存
let huobiData = {
    'huobi-market-tickers': ""
}
// 市场货币价格
let market_tickers_index = 0
const huobiMarketTickers = require('./app/services/ws.huobi.market.tickers')
huobiMarketTickers.callback = async function (data) {
    if (data.key == "huobi-market-tickers") {
        // 平台币
        let currency_platform_res = await service_currency_platform.list(0, 999)
        for (let i = 0; i < currency_platform_res.list.length; i++) {
            let item = currency_platform_res.list[i]
            delete item['abstract']
            delete item['desc']
            const list_1min = await service_kline_history.listBySymbol(String(item.symbol).toLowerCase() + "usdt", "1min", 1)
            const list_1day = await service_kline_history.listBySymbol(String(item.symbol).toLowerCase() + "usdt", "1day", 1)
            if (list_1day.length > 0 && list_1min.length > 0) {
                item['history'] = {
                    list_1min, list_1day
                }
            }
        }

        // 合约币
        let currency_contract_res = await service_currency_contract.list(0, 999)
        for (let i = 0; i < currency_contract_res.list.length; i++) {
            let item = currency_contract_res.list[i]
            const list_1min = await service_kline_history.listBySymbol(String(item.symbol).toLowerCase() + "usdt", "1min", 1)
            const list_1day = await service_kline_history.listBySymbol(String(item.symbol).toLowerCase() + "usdt", "1day", 1)
            if (list_1day.length > 0 && list_1min.length > 0) {
                item['history'] = {
                    list_1min, list_1day
                }
            }

        }

        const objectData = {
            list: data.value,
            currency_platform: currency_platform_res.list,
            currency_contract: currency_contract_res.list,
        }
        huobiData['huobi-market-tickers'] = JSON.stringify(objectData)
        market_tickers_index++
        // console.log("广播行情数据...", market_tickers_index)
        // 广播给客户端
        broadcastPathSendText('/market.tickers', huobiData['huobi-market-tickers'])
    }
}
huobiMarketTickers.init()




// 初始化 合约列表数据
let contractClass = {
    tradeArr: [],
    async reloadTradeList() {
        this.initContractList()
    },
    async initContractList() {
        let contractTradeObj = await service_currency_contract_trade_log.listBySymbol('btc', 0, 99)
        contractClass.tradeArr = contractTradeObj.list
        console.log('合约列表，委托和交易成功的订单：', contractClass.tradeArr.length)
        return true
    },
    async trade() {
        // 风险率
        const RISK_RATIO = 0.8
        // 状态 0无，1委托中，2交易成功，3撤回成功，4平仓
        for (let i = 0; i < contractClass.tradeArr.length; i++) {
            let item = contractClass.tradeArr[i]

            if (item.status == 1) {
                // 1 委托中，修改委托状态

                if (item.action == 'long' && item.price >= currBtcLastPrice) {
                    item.status = 2
                    await service_currency_contract_trade_log.updateFieldValue(item.id, 'status', 2)
                    // 通知客户端
                    broadcastUIDSendText(item.user_id, JSON.stringify({ ch: 'market.contract.trade', msg: config.common.message['20010'], code: 20010, item: item }))
                } else if (item.action == 'short' && item.price <= currBtcLastPrice) {
                    item.status = 2
                    await service_currency_contract_trade_log.updateFieldValue(item.id, 'status', 2)
                    // 通知客户端
                    broadcastUIDSendText(item.user_id, JSON.stringify({ ch: 'market.contract.trade', msg: config.common.message['20010'], code: 20010, item: item }))
                }

            } else if (item.status == 2) {
                // 2 交易成功

                if (item.action == 'long' && currBtcLastPrice > 0) { // 买涨

                    let yk = (currBtcLastPrice - item.price) * item.lots
                    let percent = Math.round(yk / item.sum * 10000) / 100

                    // console.log('long', round(yk, 8), percent + "%")

                    if (item.buy_stop > 0 && item.buy_stop <= currBtcLastPrice) {
                        // 止盈
                        item.status = 4
                        item.price_sell = currBtcLastPrice
                        await service_currency_contract_trade_log.updateStatusAndPriceSell(item.id, 4, 3, currBtcLastPrice)
                        // 更新 平仓余额 到合约账户
                        await service_wallet.updateContractAmountAction(item.user_id, 'usdt', item.sum + round(yk, 8))
                        broadcastUIDSendText(item.user_id, JSON.stringify({ ch: 'market.contract.trade', msg: config.common.message['20020'], code: 20020, item: item }))
                        return true
                    }
                    if (item.sell_stop > 0 && item.sell_stop >= currBtcLastPrice) {
                        // 止损
                        item.status = 4
                        item.price_sell = currBtcLastPrice
                        await service_currency_contract_trade_log.updateStatusAndPriceSell(item.id, 4, 4, currBtcLastPrice)
                        // 更新 平仓余额 到合约账户
                        await service_wallet.updateContractAmountAction(item.user_id, 'usdt', item.sum + round(yk, 8))
                        broadcastUIDSendText(item.user_id, JSON.stringify({ ch: 'market.contract.trade', msg: config.common.message['20030'], code: 20030, item: item }))
                        return true
                    }

                    if (percent < -(RISK_RATIO * 100)) {
                        // 达到 风险率80% 自动清仓状态      100 * (1-0.8)
                        item.status = 4
                        item.price_sell = currBtcLastPrice
                        await service_currency_contract_trade_log.updateStatusAndPriceSell(item.id, 4, 2, currBtcLastPrice)
                        // // 更新 平仓余额 到合约账户(爆仓余额全部干掉)
                        // await service_wallet.updateContractAmountAction(item.user_id, 'usdt', item.sum + round(yk, 8))
                        broadcastUIDSendText(item.user_id, JSON.stringify({ ch: 'market.contract.trade', msg: config.common.message['20040'], code: 20040, item: item }))
                        return true
                    }

                } else if (item.action == 'short' && currBtcLastPrice > 0) { // 买跌

                    let yk = (currBtcLastPrice - item.price) * item.lots
                    let percent = Math.round(yk / item.sum * 10000) / 100

                    // console.log('short', round(yk, 8), percent + "%")

                    if (item.buy_stop > 0 && item.buy_stop >= currBtcLastPrice) {
                        // 止盈
                        item.status = 4
                        item.price_sell = currBtcLastPrice
                        await service_currency_contract_trade_log.updateStatusAndPriceSell(item.id, 4, 3, currBtcLastPrice)
                        // 更新 平仓余额 到合约账户
                        await service_wallet.updateContractAmountAction(item.user_id, 'usdt', item.sum + round(yk, 8))
                        broadcastUIDSendText(item.user_id, JSON.stringify({ ch: 'market.contract.trade', msg: config.common.message['20020'], code: 20020, item: item }))
                        return true
                    }
                    if (item.sell_stop > 0 && item.sell_stop <= currBtcLastPrice) {
                        // 止损
                        item.status = 4
                        item.price_sell = currBtcLastPrice
                        await service_currency_contract_trade_log.updateStatusAndPriceSell(item.id, 4, 4, currBtcLastPrice)
                        // 更新 平仓余额 到合约账户
                        await service_wallet.updateContractAmountAction(item.user_id, 'usdt', item.sum + round(yk, 8))
                        broadcastUIDSendText(item.user_id, JSON.stringify({ ch: 'market.contract.trade', msg: config.common.message['20030'], code: 20030, item: item }))
                        return true
                    }

                    if (percent >= (RISK_RATIO * 100)) {
                        // 达到 风险率80% 自动清仓状态
                        item.status = 4
                        item.price_sell = currBtcLastPrice
                        await service_currency_contract_trade_log.updateStatusAndPriceSell(item.id, 4, 2, currBtcLastPrice)
                        // // 更新 平仓余额 到合约账户(爆仓余额全部干掉)
                        // await service_wallet.updateContractAmountAction(item.user_id, 'usdt', item.sum + round(yk, 8))
                        broadcastUIDSendText(item.user_id, JSON.stringify({ ch: 'market.contract.trade', msg: config.common.message['20040'], code: 20040, item: item }))
                        return true
                    }

                }
            }
        }
        return true
    },
    async init() {
        this.initContractList()
        return true
    }
}
contractClass.init()



// 火币API提供的 btc实时价格
let currBtcLastPrice = 0
let xxx = 0
let yyy = 0
const huobi = require('./app/services/ws.huobi.js')
huobi.callback = async function (data) {
    if (data.key == 'HuoBi API') {
        if (data.value.ch == 'market.btcusdt.ticker') {
            if (currBtcLastPrice != data.value.tick.close) {
                if (xxx > 0) {
                    data.value.tick.close = xxx
                }
                // console.log('>>>--->', data.value.tick.close, new Date().toLocaleTimeString())
                contractClass.trade()
            }
            broadcastPathSendText('/market.btcusdt.ticker', JSON.stringify(data.value))
            currBtcLastPrice = data.value.tick.close
        }
    }
}
huobi.init()





// 链接集合
let connectionObj = {
    data: {},
    add(conn) {
        connectionObj.data[conn.id] = conn
    },
    remove(id) {
        connectionObj.data[id] = null
        delete connectionObj.data[id]
    },
    find(id) {
        return connectionObj.data[id]
    },
}
// 广播
function broadcastSendText(text) {
    for (let key in connectionObj.data) {
        let conn = connectionObj.data[key]
        conn.sendUTF(text)
    }
}
// 按访问路径 广播
function broadcastPathSendText(path, text) {
    for (let key in connectionObj.data) {
        let conn = connectionObj.data[key]
        if (conn.path == path) {
            conn.sendUTF(text)
        }
    }
}
// 给用户ID 发送消息
function broadcastUIDSendText(uid, text) {
    for (let key in connectionObj.data) {
        let conn = connectionObj.data[key]
        if (conn.uid == uid) {
            console.log(`给用户 ${uid} 广播消息：`, uid, text)
            conn.sendUTF(text)
        }
    }
}
// http服务
const server = http.createServer(function (request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
// 监听端口
server.listen(config.web.websocket_port, function () {
    console.log('WebSocket端口', config.web.websocket_port, utils99.Time())
});


// WebSocketServer
const wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

let connIndex = 0;
// WebSocketServer 请求事件
wsServer.on('request', async function (request) {
    let conn = request.accept();
    // @todu 拒绝 需要加强安全链接
    // request.reject();
    conn.id = `uuid_${new Date().getTime()}_` + (connIndex++)
    conn.path = request.resourceURL.path
    console.log('客户端联机', conn.path, conn.id)
    connectionObj.add(conn)

    conn.on('close', function (reasonCode, description) {
        // console.log('客户端断开联机', conn.path, conn.id)
        connectionObj.remove(conn.id)
    })

    conn.on('message', async function (message) {

        console.log('收到客户端消息', message)

        if (message.type == 'utf8') {
            let data = JSON.parse(message.utf8Data)
            if (data.ch == 'market.contract.trade') {
                switch (data.cmd) {
                    case 'reloadTradeList':
                        contractClass.reloadTradeList()
                        broadcastPathSendText('/market.tickers', JSON.stringify({ ch: 'there.contract.order' }))
                        break
                }
            }
            else if (data.ch == 'system.set_btc_price') {
                // 留着插帧用吧。。。
                xxx = data.value

                currBtcLastPrice = xxx
                contractClass.trade()

                conn.send(JSON.stringify({ ch: 'system.set_btc_price.succeed' }))

                setTimeout(() => {
                    xxx = 0
                }, data.ts)
            }
            else if (data.ch == 'system.set_contract_order_close_position') {
                // 单独设置 用户订单 输赢或爆仓
                let item = data.value
                let act = data.act
                let id = item.id
                let userId = item.user_id
                let status = 4
                let statusType = 0
                let closePositionPrice = 0
                if (act == 'win') {
                    closePositionPrice = item.buy_stop
                    statusType = 3
                } else if (act == 'lose') {
                    closePositionPrice = item.sell_stop
                    statusType = 4
                } else if (act == 'overbook') {
                    // 设置止损价后 没有达到 爆仓价 则无效
                    if (item.sell_stop <= 0) {
                        if (item.action == 'long') {
                            closePositionPrice = item.price - (item.sum * 0.801 / item.lots)
                        } else if (item.action == 'short') {
                            closePositionPrice = item.price + (item.sum * 0.801 / item.lots)
                        }
                        statusType = 2
                    } else {
                        conn.send(JSON.stringify({ ch: 'system.set_contract_order_close_position.error', msg: '参数错误', data: data }))
                        return false
                    }
                }
                else if (closePositionPrice == 0) {
                    conn.send(JSON.stringify({ ch: 'system.set_contract_order_close_position.error', msg: '参数错误', data: data }))
                    return false
                }
                // console.log(act, data.value)
                // 修改订单 状态与成交价格
                await service_currency_contract_trade_log.updateStatusAndPriceSell(id, status, statusType, closePositionPrice)
                // 给用户广播
                broadcastUIDSendText(userId, JSON.stringify({ ch: 'market.contract.trade', msg: config.common.message['20040'], code: 20040 }))
                // 给管理端发送完成消息
                conn.send(JSON.stringify({ ch: 'system.set_contract_order_close_position.succeed' }))
            }
        }




        // 	if (message.type === 'utf8') {
        // 		console.log('Received Message: ' + message.utf8Data);
        // 		connection.sendUTF(message.utf8Data);
        // 	}
        // 	else if (message.type === 'binary') {
        // 		console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
        // 		connection.sendBytes(message.binaryData);
        // 	}
    })


    // if (conn.path === '/coin/price' && platform_currency_data) {
    //     let data = {
    //         platform: JSON.parse(platform_currency_data),
    //         cache: coincap.data.cache
    //     }
    //     conn.sendUTF(JSON.stringify(data))
    // }

    // 合约交易
    let contract_trade_path = '/contract.trade/?uid='
    if (conn.path.indexOf(contract_trade_path) != -1) {
        const userId = Number(conn.path.replace(contract_trade_path, ''))
        const start = 0
        const size = 99
        conn.uid = userId
        // 推送给客户 历史记录
        const res = await service_currency_contract_trade_log.listByUserId(userId, start, size)
        conn.sendUTF(JSON.stringify(res.list))
    }

    // 实时市场行情
    if (conn.path === '/market.tickers' && huobiData['huobi-market-tickers']) {
        conn.sendUTF(huobiData['huobi-market-tickers'])
    }

});

console.log('\n开始================================================================')

