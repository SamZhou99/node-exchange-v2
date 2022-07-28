const WebSocketClient = require('websocket').client;
const moment = require('moment');
const config = require('./config/all.js');
const task = require('./app/services/task/kline.js')

let client, connect

function out(text) {
    console.log(moment().utcOffset(+8).format('HH:mm:ss.SSS') + '：', text);
}

function initWSClient() {
    client = new WebSocketClient();

    client.on('connectFailed', function (error) {
        console.log('Connect Error: ' + error.toString());
        reconnection()
    });

    client.on('connect', function (connection) {
        connect = connection
        out('WebSocket Client Connected');
        connection.on('error', function (error) {
            out("Connection Error: " + error.toString());
            reconnection()
        });
        connection.on('close', function () {
            out('echo-protocol Connection Closed');
            reconnection()
        });
        connection.on('message', function (message) {
            // message.type === 'utf8'
            // message.utf8Data
            console.log('message', message)
        });
    });

    let uri = `ws://127.0.0.1:${config.web.websocket_port}/kline.update.success`
    // client.connect(uri, 'echo-protocol');
    client.connect(uri);
}

function reconnection() {
    if (client) {
        connect = null
        client = null
        setTimeout(() => {
            initWSClient()
        }, 1000)
    }
}

async function init() {
    initWSClient()

    await task.init("btcusdt", (res) => {
        let data = {
            ch: 'kline.update.success',
            symbol: 'btcusdt',
            data: res,
        }
        if (connect) {
            connect.sendUTF(JSON.stringify(data))
        }
    })
}

init()