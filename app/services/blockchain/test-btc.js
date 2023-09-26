const blockchain = require('./btc.js')

async function init() {
    let res = await blockchain.get(
        '12XpGsq8r6wrMuXEFBdMjiiPcr2PuJKp7w'
        // '1AzWtRS4ZpxxVhR8MjMmW3x8CNSRhv9QW9'
        // '1P46orWf7cCveV6n8cRqhNncBYLd1ZxknT'
    )
    console.log(res)
    if (!res) return

    let value = 0
    for (let index = 0; index < res.length; index++) {
        const item = res[index];
        value += item.value
    }
    let sum = blockchain.roundValue(value)
    console.log("合计：", sum)
}

init()