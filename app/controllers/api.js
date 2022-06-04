const utils99 = require('node-utils99')
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
const service_currency_contract_trade_log = require('../services/currency_contract_trade_log.js');
const service_wallet = require('../services/wallet.js');
const service_syste_wallet_address = require('../services/system_wallet_address.js');
const service_email_verify_code = require('../services/mail/email_verify_code.js');
const service_gmail = require('../services/mail/gmail.js');
const service_titan = require('../services/mail/titan.js');



let _t = {
    test: {
        async ip(request, reply) {
            const ip = request.headers
            return { flag: 'ok', data: { ip } }
        }
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
            const type = 0 // 0普通会员，1营销人员
            const status = 1 // 0禁用，1啟用
            const ip = request.headers['x-real-ip'] || request.ip // 客戶端IP
            let email_verify = 0 // 0未驗證郵箱，1已驗證郵箱
            let agent_id = 0

            // 检查帐户 是否存在
            const isExist = await service_member.oneByAccount(Email)
            if (isExist) {
                reply.send({ flag: config.common.message[10030], code: 10030 })
                return
            }

            // 检查邮箱验证
            const emailVerifyRes = await service_email_verify_code.oneByEmailCode(Email, EmailVerify)
            if (!emailVerifyRes) {
                return { flag: config.common.message[10010], code: 10010 }
            }
            email_verify = 1

            // 检查邀请码 是否正确
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
            @todo 可以跟后台 创建营销账号 使用同一段代码
            *****************************************************/
            // 创建帐户
            const createMemberRes = await service_member.createMember(agent_id, Email, utils99.MD5(password), notes, type, status, email_verify, ip)
            console.log(createMemberRes)
            // 账户关联的钱包和地址
            const newUserId = createMemberRes.insertId
            // 给用户绑定一个钱包地址
            const btc = await service_syste_wallet_address.oneByUnused(newUserId, 'btc')
            const eth = await service_syste_wallet_address.oneByUnused(newUserId, 'eth')
            const usdt = await service_syste_wallet_address.oneByUnused(newUserId, 'usdt')
            // 给我的资产中添加钱包地址
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

            // 检查帐户 是否存在
            const isExist = await service_member.oneByAccount(email)
            if (isExist) {
                return { flag: config.common.message[10030], code: 10030 }
            }

            // 生成验证码
            let code = service_email_verify_code.getVerifyCode()
            const emailRes = await service_email_verify_code.oneByEmail(email)
            if (emailRes) {
                code = emailRes.code
            } else {
                // 验证入库
                const addRes = await service_email_verify_code.add(email, code)
                console.log(addRes)
            }

            // 发送邮箱验证码
            const time = utils99.Time()
            const sendRes = await service_titan.sendMail(email, 'Mailbox Verify Code', `Code : <h1>${code}</h1>Time : ${time}`)
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
                // TODO:应该有个机制或黑名单记录，防黑客暴力破解。
                return { flag: config.common.message[10050], code: 10050 }
            }

            if (member.email_verify == 0) {
                return { flag: config.common.message[10010], code: 10010 }
            }

            // 添加 登录日志
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
            // 限时和不限时 都要显示
            let isCurrTime = query.isCurrTime
            if (isCurrTime) {
                isCurrTime = isCurrTime == 'true' ? true : false
            }
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
            // const platformBalanceRes = await service_wallet.oneByCoinName(user_id, PlatformCoinType)
            // const pfRes = await service_wallet.updateAssetsAmount(user_id, PlatformCoinType, platformBalanceRes.assets_amount + PlatformCoinAmount)
            // @todo 上面，两个合成一个
            const pfRes = await service_wallet.updateAddSubAssetsAmount(user_id, PlatformCoinType, PlatformCoinAmount, '+')

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
            const status = 2 // 1委托状态，2直接成交状态

            if (action == 'buy' || action == 'sell') {
                const act = (action == "buy") ? 'long' : 'short'
                const tradeRes = await service_currency_contract_trade_log.addLog(user_id, multiple, status, handling_fee, price, lots, margin, act, symbol)
                console.log(tradeRes)
                // 获取用户usdt余额
                const walletRes = await service_wallet.oneByCoinName(user_id, "usdt")
                // 扣除合约余额
                const balance = walletRes.contract_amount - margin
                // 更新合约余额
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
        },


        // 设置 止盈止损 价格
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



        // 撤回 & 平仓
        put_withdraw_opts: {
            schema: {
                body: S.object()
                    .prop('id', S.integer().required())
            }
        },
        // 撤回
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
        // 手动平仓
        async put_close_a_position(request, reply) {
            const body = request.body
            const id = body.id
            const price = body.price
            // 更新 平仓 状态
            await service_currency_contract_trade_log.updateStatusAndPriceSell(id, 4, 1, price)

            // 更新 平仓余额 到合约账户
            const item = await service_currency_contract_trade_log.oneById(id)
            const profit_loss = (price - item.price) * item.lots
            const usd = Math.round(profit_loss * 100000000) / 100000000
            await service_wallet.updateContractAmountAction(item.user_id, 'usdt', item.sum + usd)

            return { flag: 'ok', profit_loss }
        },
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