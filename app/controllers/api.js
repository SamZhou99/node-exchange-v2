const utils99 = require('node-utils99')
const fs = require('fs')
const S = require('fluent-schema')

const service_db = require('../services/db.init.js')
const config = require('../../config/all.js');

const service_config = require('../services/config.js');
const service_member = require('../services/member.js');
const service_agent = require('../services/agent.js');
const service_caches = require('../services/caches.js');
const service_kline = require('../services/kline.js');
const service_kline_history = require('../services/kline_history.js');
const service_login_log = require('../services/login_log.js');
const service_currency_platform = require('../services/currency_platform.js');
const service_currency_platform_buy = require('../services/currency_platform_trade_log.js');
const service_currency_contract = require('../services/currency_contract.js');
const service_currency_contract_charges = require('../services/currency_contract_charges.js');
const service_currency_contract_trade_log = require('../services/currency_contract_trade_log.js');
const service_wallet = require('../services/wallet.js');
const service_syste_wallet_address = require('../services/system_wallet_address.js');
const service_syste_pv_log = require('../services/system_pv_log.js');
const service_email_verify_code = require('../services/mail/email_verify_code.js');
const service_gmail = require('../services/mail/gmail.js');
const service_titan = require('../services/mail/titan.js');



let _t = {
    test: {
        async ip(request, reply) {
            const ip = request.headers
            return { flag: 'ok', data: { ip } }
        },

        save_file_opts: {
            schema: {
                body: S.object()
                    .prop('content', S.string().minLength(1).required())
            }
        },
        async save_file(request, reply) {
            let body = request.body
            let content = body.content
            let json = JSON.parse(content)
            let type = json.type
            let name = utils99.moment().format('YYYYMMDD_HHmmss')
            let file_name = `./public/kline-template/${type}_${name}.json`
            utils99.fsTools.text.Save(content, file_name, () => {
                reply.send({ flag: 'ok' })
            })
        },
    },
    init: {
        async init_db_web(request, reply) {
            await service_db.init_web()
            return { flag: 'ok' }
        },
        async init_db_admin(request, reply) {
            await service_db.init_admin()
            return { flag: 'ok' }
        },
    },
    config: {
        async get(request, reply) {
            const res = await service_config.list()
            reply.send({ flag: 'ok', data: res })
        },
    },
    pv: {
        opts: {
            schema: {
                querystring: S.object()
                    .prop('url', S.string().required())
            }
        },
        async get(request, reply) {
            const query = request.query
            let user_id = 0
            let ip = request.headers['cf-connecting-ip'] || request.headers['x-real-ip'] || request.ip
            let ua = request.headers['user-agent']
            let referer = ''
            let url = query.url
            if (query.token) {
                let b = Buffer.from(query.token, 'base64')
                let s = b.toString('utf8');
                let j = JSON.parse(s)
                user_id = j.id
            }
            await service_syste_pv_log.add(user_id, ip, referer, url, ua)
            return { flag: 'ok' }
        },
    },
    register: {
        opts: {
            schema: {
                body: S.object()
                    .prop('Email', S.string().format(S.FORMATS.EMAIL).required())
                    .prop('Password', S.string().minLength(6).required())
                    .prop('ConfirmPassword', S.string().minLength(6).required())
                    .prop('IsRead', S.mixed([S.TYPES.BOOLEAN, S.TYPES.NUMBER])),
            }
        },
        async post(request, reply) {
            const body = request.body
            const Email = body.Email
            const EmailVerify = body.EmailVerify
            const password = body.Password
            const notes = ''
            const type = 0 // 0???????????????1????????????
            const status = 1 // 0?????????1??????
            const ip = request.headers['x-real-ip'] || request.ip // ?????????IP
            let email_verify = 0 // 0??????????????????1???????????????
            let agent_id = 0

            // ???????????? ????????????
            const isExist = await service_member.oneByAccount(Email)
            if (isExist) {
                reply.send({ flag: config.common.message[10030], code: 10030 })
                return
            }

            // ??????????????????
            const emailVerifyRes = await service_email_verify_code.oneByEmailCode(Email, EmailVerify)
            if (!emailVerifyRes) {
                return { flag: config.common.message[10010], code: 10010 }
            }
            email_verify = 1

            // ??????????????? ????????????
            if (body.ReferralCode) {
                const agent = await service_agent.oneByCode(body.ReferralCode)
                if (agent) {
                    agent_id = agent.id
                } else {
                    reply.send({ flag: config.common.message[10020], code: 10020 })
                    return
                }
            }

            /*****************************************************
            @todo ??????????????? ?????????????????? ?????????????????????
            *****************************************************/
            // ????????????
            const createMemberRes = await service_member.createMember(agent_id, Email, utils99.MD5(password), notes, type, status, email_verify, ip)
            console.log(createMemberRes)
            // ??????????????????????????????
            const newUserId = createMemberRes.insertId
            // ?????????????????????????????????
            const btc = await service_syste_wallet_address.bindWalletAddressByUserId(newUserId, 'btc')
            const eth = await service_syste_wallet_address.bindWalletAddressByUserId(newUserId, 'eth')
            const usdt = await service_syste_wallet_address.bindWalletAddressByUserId(newUserId, 'usdt')
            // ????????????????????????????????????
            await service_wallet.addWallet(newUserId, 0, 0, 0, 'btc', btc.address)
            await service_wallet.addWallet(newUserId, 0, 0, 0, 'eth', eth.address)
            await service_wallet.addWallet(newUserId, 0, 0, 0, 'usdt', usdt.address)
            const platformRes = await service_currency_platform.list(0, 999)
            const platformList = platformRes.list
            for (let i = 0; i < platformList.length; i++) {
                let item = platformList[i]
                await service_wallet.addWallet(newUserId, 1, 0, 0, item.symbol.toLocaleLowerCase(), '')
            }

            reply.send({ flag: 'ok' })
        }
    },
    send_email_verify: {
        opts: {
            schema: {
                body: S.object()
                    .prop('Email', S.string().format(S.FORMATS.EMAIL).required())
            }
        },
        async post(request, reply) {
            const body = request.body
            const email = body.Email

            // ???????????? ????????????
            const isExist = await service_member.oneByAccount(email)
            if (isExist) {
                return { flag: config.common.message[10030], code: 10030 }
            }

            // ???????????????
            let code = service_email_verify_code.getVerifyCode('1234567890')
            const emailRes = await service_email_verify_code.oneByEmail(email)
            if (emailRes) {
                code = emailRes.code
            } else {
                // ????????????
                const addRes = await service_email_verify_code.add(email, code)
                console.log(addRes)
            }

            // ?????????????????????
            const time = utils99.Time(config.web.timezone)
            const sendRes = await service_titan.sendMail(email, 'Mailbox Verify Code', `Code : <p><span style="color:#ffee00;background-color:#000000;font-size:2rem;padding:1rem;font-family:Verdana;">${code}</span></p><p>Time : ${time}</p>`)
            console.log(code, sendRes)

            return {
                flag: 'ok', data: {
                    email
                }
            }
        }
    },
    login: {
        opts: {
            schema: {
                body: S.object()
                    .prop('Email', S.string().format(S.FORMATS.EMAIL).required())
                    .prop('Password', S.string().minLength(6).required())
            }
        },
        async post(request, reply) {
            const body = request.body
            const account = body.Email
            const password = utils99.MD5(body.Password)
            const status = 1
            const member = await service_member.oneByAccountPassword(account, password, status)

            if (!member) {
                // TODO:???????????????????????????????????????????????????????????????
                return { flag: config.common.message[10050], code: 10050 }
            }

            if (member.email_verify == 0) {
                return { flag: config.common.message[10010], code: 10010 }
            }

            // ?????? ????????????
            const user_agent = request.headers['user-agent']
            const ip = request.headers['cf-connecting-ip'] || request.headers['x-real-ip'] || request.ip
            await service_login_log.addLoginLog(member.id, service_login_log.UserType.MEMBER, user_agent, ip)

            reply.send({ flag: 'ok', data: member })
            return
        }
    },
    forgot_password: {
        opts: {
            schema: {
                body: S.object()
                    .prop('Email', S.string().format(S.FORMATS.EMAIL).required())
            }
        },
        async post(request, reply) {
            const body = request.body
            const account = body.Email
            reply.send({ flag: 'ok' })
        }
    },
    caches: {
        opts: {
            schema: {
                querystring: S.object()
                    .prop('key', S.string().required())
            }
        },
        async get(request, reply) {
            const query = request.query
            const key = query.key
            let res = await service_caches.get(key)
            if (res) {
                res.value = JSON.parse(res.value)
            }
            reply.send({ flag: 'ok', data: res })
        }
    },
    kline: {
        opts: {
            schema: {
                querystring: S.object()
                    .prop('symbol', S.string().required())
                    .prop('period', S.string().required())
                    .prop('size', S.integer())
                    .prop('isCurrTime', S.string())
            }
        },
        async get(request, reply) {
            const query = request.query
            let symbol = query.symbol || 'btcusdt'
            let period = query.period || '1day'
            let size = query.size || '365'
            // ?????????????????? ????????????
            let isCurrTime = query.isCurrTime == 'false' ? false : true

            let symbol_type = await service_kline_history.getSymbolType(symbol)

            let klineRes
            if (symbol_type == "contract") {
                klineRes = await service_kline.contract.get(symbol, period, size, isCurrTime)
            }
            else if (symbol_type == "platform") {
                klineRes = await service_kline.platform.get(symbol, period, size, isCurrTime)
            }
            else {
                klineRes = await service_kline.get(symbol, period, size)
            }
            console.log("kline", utils99.Time())
            return { flag: 'ok', data: klineRes }
        },

        post_opts: {
            schema: {
                body: S.object()
                    .prop('symbol', S.string().minLength(5).required())
                    .prop('period', S.string().minLength(3).required())
                    .prop('kline', S.string().minLength(3).required())
            }
        },
        async post(request, reply) {
            const body = request.body
            const symbol = body.symbol
            const period = body.period
            const kline = JSON.parse(body.kline)
            const res = await service_kline_history.updateAllData(symbol, period, kline)
            return {
                flag: 'ok', data: {
                    symbol, period, kline: kline.length, res
                }
            }
        },


        delete_opts: {
            schema: {
                body: S.object()
                    .prop('id', S.integer().required())
                    .prop('type', S.string().minLength(1).required())
            }
        },
        async delete(request, reply) {
            const body = request.body
            const id = body.id
            const type = body.type
            let symbol = null
            if (type.toLocaleLowerCase() == 'coinplatform') {
                let res = await service_currency_platform.oneById(id)
                symbol = res.symbol.toLocaleLowerCase() + 'usdt'
            } else if (type.toLocaleLowerCase() == 'coincontract') {
                let res = await service_currency_contract.oneById(id)
                symbol = res.symbol.toLocaleLowerCase() + 'usdt'
            }
            const res = await service_kline_history.clearHistoryBySymbol(symbol)
            return { flag: 'ok', data: { body, symbol } }
        },
    },
    kline_template: {
        get_opts: {
            schema: {
                querystring: S.object()
                // .prop('symbol', S.string().required())
                // .prop('period', S.string().required())
                // .prop('size', S.integer())
                // .prop('isCurrTime', S.string()),
            }
        },
        async get(request, reply) {
            let path = __dirname + '/../../public/kline-template'
            let list = fs.readdirSync(path)
            return { flag: 'ok', data: list }
        },

        post_opts: {
            schema: {
                body: S.object()
                    .prop('content', S.string().minLength(5).required())
            }
        },
        async post(request, reply) {
            let body = request.body
            let content = body.content
            let json = JSON.parse(content)
            let type = json.type
            let name = utils99.moment().format('YYYYMMDD_HHmmss')
            let file_name = __dirname + `/../../public/kline-template/${type}_${name}.json`
            utils99.fsTools.text.Save(content, file_name, () => {
                reply.send({ flag: 'ok' })
            })
        },

        delete_opts: {
            schema: {
                body: S.object()
                    .prop('name', S.string().minLength(5).required())
            }
        },
        async delete(request, reply) {
            let name = request.query.name
            let path = __dirname + `/../../public/kline-template/${name}`
            let res = fs.unlinkSync(path)
            return { flag: 'ok', data: res }
        },
    },

    currency_platform: {
        opts: {
            schema: {
                querystring: S.object()
                    .prop('page', S.integer())
                    .prop('size', S.integer())
                    .prop('all', S.integer())
            }
        },
        async get(request, reply) {
            const query = request.query
            const page = query.page || 1
            const size = query.size || 10
            const start = (page - 1) * size
            const all = query.all || 0

            let currencyPlatformRes = await service_currency_platform.list(start, size)
            if (all <= 0) {
                currencyPlatformRes.list.forEach(function (item) {
                    delete item.abstract
                    delete item.desc
                })
            }
            reply.send({
                flag: 'ok', data: {
                    list: currencyPlatformRes.list,
                    page: {
                        total: currencyPlatformRes.total,
                        page, size
                    }
                }
            })
        },
        async getItem(request, reply) {
            const query = request.query
            const params = request.params
            const user_id = query.user_id
            const coin_name = params.coin_name
            const item = await service_currency_platform.oneBySymbol(coin_name)
            if (!item) {
                return { flag: 'no data' }
            }

            // const cachesRes = await service_caches.get('coincap-coin-list')
            const cachesRes = await service_caches.get('huobi-market-tickers')
            let data = {
                currencyPlatform: item,
                caches: JSON.parse(cachesRes.value)
            }

            if (user_id) {
                data.walletList = await service_wallet.list(user_id)
            }

            return {
                flag: 'ok', data: data
            }
        },

        post_opts: {
            schema: {
                body: S.object()
                    .prop('user_id', S.integer().required())
                    .prop('CoinAmount', S.number().required())
                    .prop('CoinType', S.string().required())
                    .prop('PlatformCoinAmount', S.number().required())
                    .prop('PlatformCoinType', S.string().required())
            }
        },
        async post(request, reply) {
            // @todo ??????????????????????????? ??????/??????
            const body = request.body
            const user_id = body.user_id
            const CoinAmount = body.CoinAmount
            const CoinType = body.CoinType
            const PlatformCoinAmount = body.PlatformCoinAmount
            const PlatformCoinType = body.PlatformCoinType

            // ??????????????????
            const res = await service_wallet.oneByCoinName(user_id, CoinType)
            if (res.assets_amount < CoinAmount) {
                return { flag: 'not sufficient funds!' }
            }
            // ??????????????????????????????
            const balance = res.assets_amount - CoinAmount
            const balanceRes = await service_wallet.updateAssetsAmount(user_id, CoinType, balance)
            // ???????????? ?????????????????????
            // const platformBalanceRes = await service_wallet.oneByCoinName(user_id, PlatformCoinType)
            // const pfRes = await service_wallet.updateAssetsAmount(user_id, PlatformCoinType, platformBalanceRes.assets_amount + PlatformCoinAmount)
            // @todo ???????????????????????????
            const pfRes = await service_wallet.updateAddSubAssetsAmount(user_id, PlatformCoinType, PlatformCoinAmount, '+')

            // ???????????? ?????????????????????
            const operator_id = 0
            const notes = "?????????????????????"
            const action = "add"
            const addLogRes = await service_currency_platform_buy.addLog(user_id, operator_id, CoinAmount, CoinType, PlatformCoinAmount, PlatformCoinType, notes, action)
            return {
                flag: 'ok', data: {
                    balanceRes,
                    pfRes,
                    addLogRes,
                }
            }
        },
    },

    currency_contract: {
        async list(request, reply) {
            const start = 0
            const size = 999
            const res = await service_currency_contract.list(start, size)
            return { flag: 'ok', data: { list: res.list } }
        },

        opts: {
            schema: {
                querystring: S.object()
                    .prop('user_id', S.integer().required())
                    .prop('page', S.integer())
                    .prop('size', S.integer())
            }
        },
        async get(request, reply) {
            const query = request.query
            const user_id = query.user_id
            const page = query.page || 1
            const size = query.size || 10
            const start = (page - 1) * size
            const status = 4 // ???????????????
            const closeResult = await service_currency_contract_trade_log.listByCloseUserId(user_id, status, start, size)
            const tradeList = await service_currency_contract_trade_log.listByTradeUserId(user_id)
            reply.send({
                flag: 'ok', data: {
                    tradeList,
                    closeList: {
                        list: closeResult.list,
                        page: {
                            total: closeResult.total,
                            page,
                            size
                        }
                    }
                }
            })
        },


        charge_opts: {
            schema: {
                querystring: S.object()
                // .prop('user_id', S.integer().required())
                // .prop('page', S.integer())
                // .prop('size', S.integer())
            }
        },
        async charge_get(request, reply) {
            const res = await service_currency_contract_charges.list()
            return { flag: 'ok', data: res }
        },

        charge_put_opts: {
            schema: {
                body: S.object()
                    // .prop('id', S.integer().required())
                    .prop('label', S.string().minLength(1).required())
                    .prop('charge', S.number().required())
                    .prop('lots', S.number().required())
            }
        },
        async charge_put(request, reply) {
            const body = request.body
            const id = body.id
            const label = body.label
            const charge = body.charge
            const lots = body.lots
            let res
            if (id) {
                res = await service_currency_contract_charges.update(id, label, charge, lots)
            } else {
                res = await service_currency_contract_charges.add(label, charge, lots)
            }

            return { flag: 'ok', data: res }
        },


        post_opts: {
            schema: {
                body: S.object()
                    .prop('user_id', S.integer().required())
                    .prop('symbol', S.string().required()) //?????????
                    .prop('lots', S.number().required()) //??????
                    .prop('multiple', S.number().required()) //??????
                    .prop('handling_fee', S.number().required()) //?????????
                    .prop('margin', S.number().required()) //?????????
                    .prop('price', S.number()) //??????
            }
        },
        async post(request, reply) {
            // const action = request.params.action
            const body = request.body
            const user_id = body.user_id
            const action = body.action
            const symbol = body.symbol.toLocaleLowerCase()
            const lots = body.lots
            const multiple = body.multiple
            const handling_fee = body.handling_fee
            const margin = body.margin
            const price = body.price
            const status = 2 // 1???????????????2??????????????????

            if (action == 'buy' || action == 'sell') {
                // ????????????usdt??????
                const walletRes = await service_wallet.oneByCoinName(user_id, "usdt")
                // ??????????????????
                const balance = walletRes.contract_amount - margin
                // ??????????????????
                const walletUpdateRes = await service_wallet.updateContractAmount(user_id, "usdt", balance)
                // ??????????????????????????????
                const act = (action == "buy") ? 'long' : 'short'
                const tradeRes = await service_currency_contract_trade_log.addLog(user_id, multiple, status, handling_fee, price, lots, margin, act, symbol, balance)

                return {
                    flag: 'ok', data: {
                        action,
                        body,
                        walletRes,
                        walletUpdateRes,
                        tradeRes,
                    }
                }
            }

            return { flag: 'action error' }
        },


        // ?????? ???????????? ??????
        put_opts: {
            schema: {
                body: S.object()
                    .prop('id', S.integer().required())
                    .prop('buyStop', S.number().required())
                    .prop('sellStop', S.number().required())
            }
        },
        async put_buy_sell_price(request, reply) {
            const body = request.body
            const id = body.id
            const buyStop = body.buyStop
            const sellStop = body.sellStop
            await service_currency_contract_trade_log.updateBuyStopSellStop(id, buyStop, sellStop)
            return { flag: 'ok' }
        },



        // ?????? & ??????
        put_withdraw_opts: {
            schema: {
                body: S.object()
                    .prop('id', S.integer().required())
            }
        },
        // ??????
        async put_withdraw(request, reply) {
            const body = request.body
            const id = body.id
            await service_currency_contract_trade_log.updateFieldValue(id, 'status', 3)
            return { flag: 'ok' }
        },
        put_close_a_position_opts: {
            schema: {
                body: S.object()
                    .prop('id', S.integer().required())
                    .prop('price', S.number().required())
            }
        },
        // ????????????
        async put_close_a_position(request, reply) {
            const body = request.body
            const id = body.id
            const price = body.price

            // ???????????????????????????????????????????????????
            let tradeItem = await service_currency_contract_trade_log.oneById(id)
            if (tradeItem != null && tradeItem.status == 4) {
                return { flag: 'Order status has been closed!' }
            }


            // ?????? ?????? ??????
            await service_currency_contract_trade_log.updateStatusAndPriceSell(id, 4, 1, price)

            // ?????? ???????????? ???????????????
            const item = await service_currency_contract_trade_log.oneById(id)
            const profit_loss = (price - item.price) * item.lots
            const usd = Math.round(profit_loss * 100000000) / 100000000
            await service_wallet.updateContractAmountAction(item.user_id, 'usdt', item.sum + usd)

            return { flag: 'ok', profit_loss }
        },
    },

}
module.exports = _t



// const bodyJsonSchema = S.object()
//   .prop('someKey', S.string())
//   .prop('someOtherKey', S.number())
//   .prop('requiredKey', S.array().maxItems(3).items(S.integer()).required())
//   .prop('nullableKey', S.mixed([S.TYPES.NUMBER, S.TYPES.NULL]))
//   .prop('multipleTypesKey', S.mixed([S.TYPES.BOOLEAN, S.TYPES.NUMBER]))
//   .prop('multipleRestrictedTypesKey', S.oneOf([S.string().maxLength(5), S.number().minimum(10)]))
//   .prop('enumKey', S.enum(Object.values(MY_KEYS)))
//   .prop('notTypeKey', S.not(S.array()))

// const queryStringJsonSchema = S.object()
//   .prop('name', S.string())
//   .prop('excitement', S.integer())

// const paramsJsonSchema = S.object()
//   .prop('par1', S.string())
//   .prop('par2', S.integer())

// const headersJsonSchema = S.object()
//   .prop('x-foo', S.string().required())

// // Note that there is no need to call `.valueOf()`!
// const schema = {
//   body: bodyJsonSchema,
//   querystring: queryStringJsonSchema, // (or) query: queryStringJsonSchema
//   params: paramsJsonSchema,
//   headers: headersJsonSchema
// }