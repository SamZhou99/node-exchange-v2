const utils99 = require('node-utils99')
const { db } = require('../../../lib/db.setup.js')
const config = require('../../../config/all.js')

const key = config.blockchain.eth.key

function getHashValue(data, address) {
    if (data.status != 'success') {
        console.log(data.status)
        return []
    }
    if (data.data.address != address) {
        console.log(data.data.address, address)
        return []
    }

    let resArr = []
    const a = data.data.txs
    for (let i = 0; i < a.length; i++) {
        const item = a[i]
        resArr.push({
            address: address,
            hash: item.txid,
            ts: item.time,
            value: Number(item.value),
        })
    }
    return resArr
}

let _t = {
    async get(address) {
        const URL = `https://chain.so/api/v2/get_tx_received/BTC/${address}`
        console.log(URL)
        let httpRes = await utils99.request.axios
            .get({ url: URL, headers: utils99.request.HEADERS.pc })
            .catch(err => {
                console.log('请求异常', URL, err)
            })

        if (httpRes.statusText != 'OK') {
            console.error(httpRes)
            return null
        }
        return getHashValue(httpRes.data, address)
    },
}
module.exports = _t