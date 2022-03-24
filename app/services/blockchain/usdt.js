const utils99 = require('node-utils99')
const { db } = require('../../../lib/db.setup.js')
const config = require('../../../config/all.js')


function getHashValue(data, address) {
    let resArr = []
    const a = data.token_transfers
    for (let i = 0; i < a.length; i++) {
        const item = a[i]
        if (item.to_address == address) {
            resArr.push({
                address: item.to_address,
                hash: item.transaction_id,
                value: Number(item.quant) / 1000000,
            })
        }
    }
    return resArr
}

let _t = {
    async get(address) {
        const URL = `https://apilist.tronscan.org/api/token_trc20/transfers?limit=20&start=0&sort=-timestamp&count=true&relatedAddress=${address}`

        let httpRes = await utils99.request.axios
            .get({ url: URL, headers: utils99.request.HEADERS.mobile })
            .catch(err => {
                console.log('请求异常', URL, err)
            })

        if (httpRes.statusText.toLocaleLowerCase() != 'ok') {
            console.error(httpRes)
            return null
        }
        return getHashValue(httpRes.data, address)
    },
}
module.exports = _t