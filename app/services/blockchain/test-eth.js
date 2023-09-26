const blockchain = require('./eth.js')

async function init() {
    let res = await blockchain.get(
        '0x4ea43951e856eb13ff8e4174aa81342eef9ec957'
        // '0x4eba6bacc9edc39958c845d542c166bba4555ebb'
    )
    console.log(res)
}

init()