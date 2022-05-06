const blockchain = require('./btc.js')

async function init() {
    let res = await blockchain.get('1AzWtRS4ZpxxVhR8MjMmW3x8CNSRhv9QW9')
    console.log(res)
    res = await blockchain.get('1P46orWf7cCveV6n8cRqhNncBYLd1ZxknT')
    console.log(res)
}

init()