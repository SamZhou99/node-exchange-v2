const S = require('fluent-schema')

const service_config = require('../services/config.js');
const service_member = require('../services/member.js');
const service_agent = require('../services/agent.js');
const service_caches = require('../services/caches.js');
const service_kline = require('../services/kline.js');
const service_login_log = require('../services/login_log.js');
const service_currency_platform = require('../services/currency_platform.js');
const service_currency_platform_buy = require('../services/currency_platform_buy_log.js');
// const service_currency_contract = require('../services/currency_contract.js');
const service_currency_contract_trade_log = require('../services/currency_contract_trade_log.js');
const service_wallet = require('../services/wallet.js');


let _t = {
    config: {
        async get(request, reply) {
            const res = await service_config.list()
            reply.send({ flag: 'ok', data: res })
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
            const account = body.Email
            const password = body.Password
            const notes = ''
            const type = 1 // 1 普通会员 2 营销人员
            const status = 1
            const ip = request.ip
            let agent_id = 0

            // 检查帐户 是否存在
            const isExist = await service_member.oneByAccount(account)
            if (isExist) {
                reply.send({ flag: 'The account already exists, please change another account to register!' })
                return
            }

            // 检查邀请码 是否正确
            if (body.ReferralCode) {
                const agent = await service_agent.agentByCode(body.ReferralCode)
                if (agent) {
                    agent_id = agent.id
                } else {
                    reply.send({ flag: 'Invitation code error!' })
                    return
                }
            }

            // 创建帐户
            const res = await service_member.createMember(agent_id, account, password, notes, type, status, ip)
            reply.send({ flag: 'ok' })
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
            const password = body.Password
            const member = await service_member.oneByAccountPassword(account, password)

            if (!member) {
                // TODO:应该有个机制或黑名单记录，防黑客暴力破解。
                reply.send({ flag: 'Wrong Email or Password!' })
                return
            }

            // 添加 登录日志
            const user_agent = request.headers['user-agent']
            const ip = request.headers['x-real-ip'] || request.ip
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
                    .prop('symbol_type', S.string())
            }
        },
        async get(request, reply) {
            const query = request.query
            let symbol = query.symbol || 'btcusdt'
            let period = query.period || '1day'
            let size = query.size || '500'
            let symbol_type = query.symbol_type || ''

            let klineRes
            if (symbol_type == "currency_contract") {
                klineRes = await service_kline.contract.get(symbol, period, size)
            } else if (symbol_type == "currency_platform") {
                klineRes = await service_kline.platform.get(symbol, period, size)
            } else {
                klineRes = await service_kline.get(symbol, period, size)
            }
            reply.send({ flag: 'ok', data: klineRes })
        }
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
            // @todo 这里提交的数据应该 加密/解密
            const body = request.body
            const user_id = body.user_id
            const CoinAmount = body.CoinAmount
            const CoinType = body.CoinType
            const PlatformCoinAmount = body.PlatformCoinAmount
            const PlatformCoinType = body.PlatformCoinType

            // 检查余额数量
            const res = await service_wallet.oneByCoinName(user_id, CoinType)
            if (res.assets_amount < CoinAmount) {
                return { flag: 'not sufficient funds!' }
            }
            // 扣除用户资产相应数量
            const balance = res.assets_amount - CoinAmount
            const balanceRes = await service_wallet.updateAssetsAmount(user_id, CoinType, balance)
            // 添加用户 平台币相应数量
            const pfRes = await service_wallet.updateAssetsAmount(user_id, PlatformCoinType, PlatformCoinAmount)
            // 添加用户 平台币参与记录
            const operator_id = 0
            const notes = "用户参与平台币"
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
            const res = await service_currency_contract_trade_log.listByUserId(user_id, start, size)
            reply.send({
                flag: 'ok', data: {
                    list: res.list,
                    page: {
                        total: res.total,
                        page, size
                    }
                }
            })
        },


        post_opts: {
            schema: {
                body: S.object()
                    .prop('user_id', S.integer().required())
                    .prop('symbol', S.string().required()) //交易对
                    .prop('lots', S.number().required()) //手数
                    .prop('multiple', S.number().required()) //倍数
                    .prop('handling_fee', S.number().required()) //手续费
                    .prop('margin', S.number().required()) //保证金
                    .prop('price', S.number()) //价格
            }
        },
        async post(request, reply) {
            const action = request.params.action
            const body = request.body
            const user_id = body.user_id
            const symbol = body.symbol.toLocaleLowerCase()
            const lots = body.lots
            const multiple = body.multiple
            const handling_fee = body.handling_fee
            const margin = body.margin
            const price = body.price
            const status = 1

            if (action == 'buy') {
                const tradeRes = await service_currency_contract_trade_log.addLog(user_id, multiple, status, handling_fee, price, lots, margin, 'add', symbol)
                console.log(tradeRes)
                // 只消费 usdt
                const walletRes = await service_wallet.oneByCoinName(user_id, "usdt")
                const balance = walletRes.contract_amount - margin
                const walletUpdateRes = await service_wallet.updateContractAmount(user_id, "usdt", balance)
                return {
                    flag: 'ok', data: {
                        action,
                        body,
                        walletRes,
                        walletUpdateRes,
                    }
                }
            }

            return { flag: 'action error' }
        }
    }
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