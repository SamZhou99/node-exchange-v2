const S = require('fluent-schema')

const service_config = require('../services/config.js');
const service_member = require('../services/member.js');
const service_agent = require('../services/agent.js');
const service_caches = require('../services/caches.js');
const service_kline = require('../services/kline.js');
const service_login_log = require('../services/login_log.js');
const service_platform_currency = require('../services/platform_currency.js');
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
            const ip = request.headers['x-real-ip']
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
            let res = await service_caches.oneByKey(key)
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
            }
        },
        async get(request, reply) {
            const query = request.query
            let symbol = query.symbol || 'btcusdt'
            let period = query.period || '1day'
            let size = query.size || '500'

            let klineRes = await service_kline.get(symbol, period, size)
            reply.send({ flag: 'ok', data: klineRes })
        }
    },

    platform_currency: {
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

            let platformCurrencyRes = await service_platform_currency.list(start, size)
            if (all <= 0) {
                platformCurrencyRes.list.forEach(function (item) {
                    delete item.abstract
                    delete item.desc
                })
            }
            reply.send({
                flag: 'ok', data: {
                    list: platformCurrencyRes.list,
                    page: {
                        total: platformCurrencyRes.total,
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
            const item = await service_platform_currency.oneBySymbol(coin_name)
            if (!item) {
                return { flag: 'no data' }
            }

            let data = { platformCurrency: item }

            if (user_id) {
                data.walletList = await service_wallet.list(user_id)
            }

            return {
                flag: 'ok', data: data
            }
        }
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