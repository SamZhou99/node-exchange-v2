const utils99 = require('node-utils99')
const { db } = require('../../../lib/db.setup.js')
const config = require('../../../config/all.js')

const key = config.blockchain.eth.key

function getHashValue(data, address) {
    let resArr = []
    const a = data.result
    for (let i = 0; i < a.length; i++) {
        const item = a[i]
        if (item.to == address) {
            resArr.push({
                address: address,
                hash: item.hash,
                value: Number(item.value / 1000000000000000000),
            })
        }
    }
    return resArr
}

let _t = {
    async get(address) {
        const URL = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=${key}`

        let httpRes = await utils99.request.axios
            .get({ url: URL, headers: utils99.request.HEADERS.mobile })
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