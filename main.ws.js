const config = require('./config/all.js')
const WebSocketServer = require('websocket').server
const http = require('http')










// 火币
const huobi = require('./app/services/ws.huobi.js')
huobi.callback = async function (data) {
    // await service.set(data.key, JSON.stringify(data.value))
    // console.log(data)
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
    console.log('WebSocket端口', new Date(), config.web.websocket_port)
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
// WebSocketServer 请求事件
wsServer.on('request', async function (request) {
    let conn = request.accept();
    // 拒绝
    // request.reject();
    conn.id = `uuid_${new Date().getTime()}_` + String(Math.random()).replace('.', '')
    conn.path = request.resourceURL.path
    console.log('联机成功', conn.path, conn.id)
    connectionObj.add(conn)

    conn.on('close', function (reasonCode, description) {
        console.log('断开联机', conn.path, conn.id)
        connectionObj.remove(conn.id)
    })

    conn.on('message', function (message) {
        // console.log('客户端消息', message)
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

});

console.log('\n开始================================================================')

