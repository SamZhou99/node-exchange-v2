const btc = require('./btc.js')
const eth = require('./eth.js')
const usdt = require('./usdt.js')

let _t = {
    async btc(address) {
        return btc.get(address)
    },
    async eth(address) {
        return eth.get(address)
    },
    async usdt(address) {
        return usdt.get(address)
    },
}


module.exports = _t