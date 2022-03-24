const blockchain = require('./usdt.js')

async function init() {
    let res = await blockchain.get('TWvdWbMNMcAu1VoJ72WzDoHJyWvoMYPUJi')
    console.log(res)
    res = await blockchain.get('TKRcrKsaAmt54BRmucwV4G5R8xPiKAAcSC')
    console.log(res)
}

init()