const utils99 = require('node-utils99')
const pako = require('pako');
const WebSocketClient = require('websocket').client;
const config = require('../../config/all.js')
const service_caches = require('./caches.js')
/*
本篇所列出的所有wss接口的baseurl为: wss://stream.binance.com:9443 或者 wss://stream.binance.com:443
Streams有单一原始 stream 或组合 stream
单一原始 streams 格式为 /ws/<streamName>
组合streams的URL格式为 /stream?streams=<streamName1>/<streamName2>/<streamName3>
订阅组合streams时，事件payload会以这样的格式封装: {"stream":"<streamName>","data":<rawPayload>}
stream名称中所有交易对均为 小写
每个到 stream.binance.com 的链接有效期不超过24小时，请妥善处理断线重连。
每3分钟，服务端会发送ping帧，客户端应当在10分钟内回复pong帧，否则服务端会主动断开链接。允许客户端发送不成对的pong帧(即客户端可以以高于10分钟每次的频率发送pong帧保持链接)。
wss://data-stream.binance.com 可以用来订阅市场信息的数据流。 用户信息无法从此URL获得。
*/
const URI1 = 'wss://stream.binance.com:9443/ws'
const URI2 = 'wss://stream.binance.com:443/ws'
const URI3 = 'wss://data-stream.binance.com/ws'



const symbol = 'btcusdt'
let _t = {
    name: 'Binance API',
    wsUrl: null,
    client: null,
    callback: null,
    subscribe: {
        ticker: {
            method: "SUBSCRIBE",
            params: ["btcusdt@trade"],
            id: 1
        },
        trade_detail: {
            // 最近成效记录
            "sub": `market.${symbol}.trade.detail`,
            "id": "id1"
        }
    },
    onConnectError(error) {
        console.log(_t.name, "联接错误", error.toString());
        _t.reWsConnection()
    },
    onConnectClose() {
        console.log(_t.name, '联机断开');
        _t.reWsConnection()
    },
    onConnectMessage(msg) {
        // if (msg.type == 'binary') {
        //     let data = pako.ungzip(msg.binaryData, { to: 'string' })
        //     data = JSON.parse(data)
        //     if (data.ping) {
        //         this.send(JSON.stringify({ pong: data.ping }))
        //         return
        //     }
        //     if (_t.callback) {
        //         _t.callback({ key: _t.name, value: data })
        //     }
        //     return
        // }
        console.log(_t.name, new Date().getTime(), '消息数据', msg)
    },
    onWsFailed(error) {
        console.log(_t.name, '联机错误', error.toString());
        _t.reWsConnection()
    },
    onWsConnection(connection) {
        console.log(_t.name, '联机成功')
        connection.on('error', _t.onConnectError);
        connection.on('close', _t.onConnectClose);
        connection.on('message', _t.onConnectMessage);
        connection.sendUTF(JSON.stringify(_t.subscribe.ticker))
    },
    reWsConnection() {
        console.log(_t.name, '重新联机');
        clearTimeout(this.tempTimeout)
        _t.tempTimeout = setTimeout(() => {
            _t.init()
        }, 1000 * 3)
    },
    async init() {
        _t.client = new WebSocketClient()
        _t.client.on('connectFailed', _t.onWsFailed)
        _t.client.on('connect', _t.onWsConnection)

        _t.wsUrl = URI3
        true ? _t.client.connect(_t.wsUrl) : _t.client.connect(_t.wsUrl, 'echo-protocol')

        console.log(`${_t.name} WS Init`, _t.wsUrl, symbol)
    }
}



if (require.main === module) {
    _t.init()
}

module.exports = _t