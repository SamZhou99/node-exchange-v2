const utils99 = require('node-utils99')
const config = require('./config/all.js')
const WebSocketServer = require('websocket').server
const http = require('http')

const service_currency_platform = require('./app/services/currency_platform.js')
const service_currency_contract = require('./app/services/currency_contract.js')










// 火币市场货币价格 缓存
let huobiData = {
    'huobi-market-tickers': ""
}
// 市场货币价格
const huobiMarketTickers = require('./app/services/ws.huobi.market.tickers')
huobiMarketTickers.callback = async function (data) {
    if (data.key == "huobi-market-tickers") {
        const currency_platform_res = await service_currency_platform.list(0, 999)
        const currency_contract_res = await service_currency_contract.list(0, 999)
        const objectData = {
            list: data.value,
            currency_platform: currency_platform_res.list,
            currency_contract: currency_contract_res.list,
        }
        huobiData['huobi-market-tickers'] = JSON.stringify(objectData)
        broadcastPathSendText('/market.tickers', huobiData['huobi-market-tickers'])
    }
}
huobiMarketTickers.init()

// 火币API提供的 btc实时价格
const huobi = require('./app/services/ws.huobi.js')
huobi.callback = async function (data) {
    if (data.key == 'HuoBi API') {
        if (data.value.ch == 'market.btcusdt.ticker') {
            broadcastPathSendText('/market.btcusdt.ticker', JSON.stringify(data.value))
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

    conn.on('message', function (message) {
        // console.log('收到客户端消息', message)
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

    // if (conn.path === '/coin/price/platform' && platform_currency_data) {
    //     conn.sendUTF(platform_currency_data)
    // }

    if (conn.path === '/market.tickers' && huobiData['huobi-market-tickers']) {
        conn.sendUTF(huobiData['huobi-market-tickers'])
    }

});

console.log('\n开始================================================================')

