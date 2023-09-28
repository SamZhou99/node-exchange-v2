const utils99 = require('node-utils99')
const { db } = require('../../../lib/db.setup.js')
const config = require('../../../config/all.js')

const key = config.blockchain.eth.key

// 保存8位小数
function roundValue(value) {
    return Math.round(Number(value) * 100000000) / 100000000
}



// 接口废弃 更新到V3 并收费
// "This version of the API is invalid or is no longer available. For API V3 documentation, see https://chain.so/api."
const chain_so_api = {
    async get(address) {
        const URL = `https://chain.so/api/v2/get_tx_received/BTC/${address}`
        console.log(URL)
        let httpRes = await utils99.request.axios
            .get({ url: URL, headers: utils99.request.HEADERS.pc })
            .catch(err => { console.log('请求异常', URL, err) })

        if (httpRes.statusText != 'OK') {
            console.error(httpRes)
            return null
        }
        return chain_so_api.formatData(httpRes.data, address)
    },

    formatData(data, address) {
        if (data.status != 'success') {
            console.log(data.status)
            return []
        }
        if (data.data.address != address) {
            console.log(data.data.address, address)
            return []
        }
        let resArr = []
        if (data.data && data.data.txs) {
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
        }
        return resArr
    },
}



// 更新时间：2023/09/26 防火墙Cloudflare
// blockchain.info
const blockchain_api = {
    async get(address) {
        const URL = `https://blockchain.info/rawaddr/${address}`
        console.log(URL)
        let httpRes = await utils99.request.axios
            .get({ url: URL, headers: utils99.request.HEADERS.pc })
            .catch(err => { console.log('请求异常', URL, err) })

        if (!httpRes) {
            console.error(httpRes)
            return null
        }

        if (httpRes.statusText != 'OK') {
            console.error(httpRes)
            return null
        }
        return blockchain_api.formatData(httpRes.data, address)
    },

    formatData(data, address) {
        if (data.address != address) {
            return null
        }

        let resArr = []
        if (data.txs) {
            const a = data.txs
            for (let i = 0; i < a.length; i++) {
                const listItem = a[i]
                for (let j = 0; j < listItem.out.length; j++) {
                    const outItem = listItem.out[j]
                    if (outItem.addr == address) {
                        resArr.push({
                            address: outItem.addr,
                            hash: outItem.script,
                            ts: listItem.time,
                            value: roundValue(outItem.value / 100000000), // BTC单位
                        })
                    }
                }
            }
        }
        return resArr
    },
}



// 测试期间有些不稳定
// btc.com
const btc_com_api = {
    async get(address) {
        const URL = `https://chain.api.btc.com/v3/address/${address}/tx`
        console.log(URL)
        let httpRes = await utils99.request.axios
            .get({ url: URL, headers: utils99.request.HEADERS.pc })
            .catch(err => { console.log('请求异常', URL, err) })

        if (!httpRes) {
            console.error(httpRes)
            return null
        }

        if (httpRes.statusText != 'OK') {
            console.error(httpRes)
            return null
        }
        return btc_com_api.formatData(httpRes.data, address)
    },

    formatData(data, address) {
        if (data.status != 'success') {
            console.log(data.status)
            return []
        }
        if (!data.data) {
            console.log(data)
            return []
        }

        let resArr = []
        if (data.data && data.data.list) {
            const a = data.data.list
            for (let i = 0; i < a.length; i++) {
                const listItem = a[i]
                for (let j = 0; j < listItem.outputs.length; j++) {
                    const outItem = listItem.outputs[j]
                    let value = outItem.value
                    let hash = outItem.spent_by_tx
                    let currAddress
                    for (let k = 0; k < outItem.addresses.length; k++) {
                        const addressItem = outItem.addresses[k]
                        if (addressItem == address) {
                            currAddress = addressItem
                            resArr.push({
                                address: currAddress,
                                hash: hash,
                                ts: listItem.block_time,
                                value: roundValue(value / 100000000), // BTC单位
                            })
                        }
                    }
                }
            }
        }
        return resArr
    },
}



// 更新时间：2023/09/26 增加一个备份接口 
// blockcypher.com
const blockcypher_com_api = {
    async get(address) {
        const URL = `https://api.blockcypher.com/v1/btc/main/addrs/${address}`
        console.log(URL)
        let httpRes = await utils99.request.axios
            .get({ url: URL, headers: utils99.request.HEADERS.pc })
            .catch(err => { console.log('请求异常', URL, err) })

        if (!httpRes) {
            console.error(httpRes)
            return null
        }

        if (httpRes.statusText != 'OK') {
            console.error(httpRes)
            return null
        }

        if (!httpRes.data) {
            console.error("httpRes.data = null")
            return null
        }
        return blockcypher_com_api.formatData(httpRes.data, address)
    },

    formatData(data, address) {
        if (data.address != address) {
            return null
        }

        let resArr = []
        if (data.txrefs) {
            const a = data.txrefs
            for (let i = 0; i < a.length; i++) {
                const listItem = a[i]
                if (!listItem.spent) {
                    resArr.push({
                        address: address,
                        hash: listItem.tx_hash,
                        ts: new Date(listItem.confirmed).getTime() / 1000,
                        value: roundValue(listItem.value / 100000000), // BTC单位
                    })
                }
            }
        }
        return resArr
    },
}



module.exports = {
    get: async (address) => {
        let api = [btc_com_api, blockcypher_com_api]
        for (let i = 0; i < api.length; i++) {
            let rsp = await api[i].get(address)
            if (rsp != null) {
                return rsp
            }
        }
        return null
    },
    roundValue
}