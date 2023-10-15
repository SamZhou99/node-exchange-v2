const utils99 = require('node-utils99')
const pako = require('pako');
const WebSocketClient = require('websocket').client;
const config = require('../../config/all.js')
const service_caches = require('./caches.js')
const common = require('../../config/common.js')

let _t = {
    name: 'HuoBi API',
    wsUrl: 'wss://api.huobi.pro/ws',
    client: null,
    callback: null,
    needSymbolList: common.coin.need,
    symbolObjList: {},
    subscribe(symbol) {
        return {
            ticker: {
                // 聚合行情（Ticker）数据
                // 获取市场聚合行情数据，每100ms推送一次。
                // market.$symbol.ticker
                "sub": `market.${symbol}.ticker`
            },
            trade_detail: {
                // 最近成效记录
                "sub": `market.${symbol}.trade.detail`,
                "id": "id1"
            }
        }
    },
    checkSymbolObjList(data) {
        let symbol = _t.getSymbolName(data.ch)
        if (!_t.symbolObjList[symbol]) {
            _t.symbolObjList[symbol] = {}
            _t.symbolObjList[symbol]['open'] = data.tick.open
            _t.symbolObjList[symbol]['high'] = data.tick.high
            _t.symbolObjList[symbol]['low'] = data.tick.low
            _t.symbolObjList[symbol]['close'] = data.tick.close
            _t.symbolObjList[symbol]['vol'] = data.tick.vol
            _t.symbolObjList[symbol]['ts'] = data.ts
            return true
        }

        if (_t.symbolObjList[symbol]['open'] !== data.tick.open ||
            _t.symbolObjList[symbol]['high'] !== data.tick.high ||
            _t.symbolObjList[symbol]['low'] !== data.tick.low ||
            _t.symbolObjList[symbol]['close'] !== data.tick.close ||
            _t.symbolObjList[symbol]['vol'] !== data.tick.vol) {
            _t.symbolObjList[symbol]['open'] = data.tick.open
            _t.symbolObjList[symbol]['high'] = data.tick.high
            _t.symbolObjList[symbol]['low'] = data.tick.low
            _t.symbolObjList[symbol]['close'] = data.tick.close
            _t.symbolObjList[symbol]['vol'] = data.tick.vol
            _t.symbolObjList[symbol]['ts'] = data.ts
            return true
        }

        return false
    },
    getSymbolName(ch) {
        let symbol = ch.replace("market.", "")
        symbol = symbol.replace("usdt.ticker", "")
        return symbol
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
        if (msg.type == 'binary') {
            let data = pako.ungzip(msg.binaryData, { to: 'string' })
            data = JSON.parse(data)
            if (data.ping) {
                this.send(JSON.stringify({ pong: data.ping }))
                return
            }
            try {
                // if (_t.checkSymbolObjList(data)) {
                //     let symbol = _t.getSymbolName(data.ch)
                //     console.log(_t.name, '消息数据', symbol, _t.symbolObjList[symbol])
                // }

                if (_t.callback && _t.checkSymbolObjList(data)) {
                    _t.callback({ key: _t.name, value: data })
                }
            } catch (e) {
                console.log(_t.name, '消息数据?????????????????', data)
            }
            return
        }
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

        _t.needSymbolList.forEach((item) => {
            let ticker = _t.subscribe(`${item}usdt`).ticker
            connection.sendUTF(JSON.stringify(ticker))
        })
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
        // _t.client.connect(_t.wsUrl, 'echo-protocol')
        _t.client.connect(_t.wsUrl)
        console.log(`${_t.name} WS Init`, _t.wsUrl)
    }
}



if (require.main === module) {
    _t.init()
}

module.exports = _t