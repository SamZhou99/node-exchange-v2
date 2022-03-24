const blockchain = require('./eth.js')

async function init() {
    let res = await blockchain.get('0x4ea43951e856eb13ff8e4174aa81342eef9ec957')
    console.log(res)
    res = await blockchain.get('0xb8f2d44aa0f9a9a353fde934b626efa60f6c896a')
    console.log(res)
}

init()