const S = require('fluent-schema')
const utils99 = require('node-utils99')
const config = require('../../config/all.js')
const service_currency_platform = require('../services/currency_platform.js');
const service_currency_platform_trade_log = require('../services/currency_platform_trade_log.js');
const service_auth = require('../services/auth.js');
const service_withdraw = require('../services/withdraw_log.js');
const service_withdrawCharges = require('../services/withdraw_charges.js');
const service_wallet = require('../services/wallet.js');
const service_wallet_log = require('../services/wallet_log.js');
const service_config = require('../services/config.js')
const service_member = require('../services/member.js')
const service_admin = require('../services/admin.js')
const service_login_log = require('../services/login_log.js')

const verifyCode = require('../../lib/verify.code.js')
const textToImage = require('text-to-image');



let _t = {
    verifyCode: {
        async get(request, reply) {
            const ip = request.headers['x-real-ip'] || request.ip
            const code = verifyCode.create(ip)
            const n1 = verifyCode.randomInt(code - 99, code - 10)
            const n2 = code - n1
            console.log("生成SEESION码：", code)
            const base64 = await textToImage.generate(`${n1} + ${n2} = ?`, {
                debug: false,
                maxWidth: 200,
                fontSize: 20,
                fontFamily: 'Verdana',
                // lineHeight: 22,
                // margin: 5,
                bgColor: '#FFFFFF',
                textColor: 'red',
                textAlign: 'center',
                verticalAlign: 'center',
            })
            return { flag: 'ok', data: base64 }
        }
    },
    login: {
        post_opts: {
            schema: {
                body: S.object()
                    .prop('account', S.string().minLength(1).required())
                    .prop('password', S.string().minLength(1).required())
                    .prop('code', S.string().minLength(1).required())
            }
        },
        async post(request, reply) {
            const body = request.body
            const account = body.account
            const password = utils99.MD5(body.password)
            const loginVerifyCode = body.code
            if (!verifyCode.isExist(loginVerifyCode)) {
                return { flag: '验证码错误!', code: 10040, message: config.common.message[10040] }
            }
            const status = 1
            const user = await service_admin.oneByAccountPassword(account, password, status)
            if (user == null) {
                return { flag: '账号或密码错误！' }
            }
            const userAgent = request.headers['user-agent']
            const IP = request.headers['x-real-ip'] || request.ip
            await service_login_log.addLoginLog(user.id, service_login_log.UserType.ADMIN, userAgent, IP)
            return { flag: 'ok', data: utils99.MD5(user.id) }
        },
    },
    member: {
        // 添加认证信息
        post_opts: {
            schema: {
                body: S.object()
                    .prop('user_id', S.integer().required())
                    .prop('country', S.string().minLength(1).required())
                    .prop('full_name', S.string().minLength(1).required())
                    .prop('id_number', S.string().minLength(1).required())
            }
        },
        async post(request, reply) {
            const body = request.body
            const user_id = body.user_id
            const country = body.country
            const full_name = body.full_name
            const id_number = body.id_number
            // 状态：0未认证,1待审核,2未通过,3通过
            const status = 1
            const failed_reason = ''
            const addAuthInfoRes = await service_auth.addAuthInfo(user_id, status, failed_reason, country, full_name, id_number)
            console.log(addAuthInfoRes)
            return reply.send({ flag: 'ok', data: { body } })
        },

        // 用户列表
        get_opts: {
            schema: {
                querystring: S.object()
                    .prop('page', S.integer())
                    .prop('size', S.integer())
            }
        },
        async get(request, reply) {
            const query = request.query
            const page = query.page || 1
            const size = query.size || 10
            const start = (page - 1) * size
            const res = await service_member.listDetail(start, size)
            const list = res.list
            const total = res.total
            return {
                flag: 'ok', data: {
                    list: list,
                    page: { total, page, size }
                }
            }
        },

        // 账号名自动完成
        auto_complete_opts: {
            schema: {
                body: S.object()
                    .prop('account', S.string().minLength(1).required())
            }
        },
        async auto_complete_post(request, reply) {
            const body = request.body
            const account = body.account
            const limit = body.limit || 5
            const list = await service_member.listByAccount(account, limit)
            return reply.send({ flag: 'ok', data: { list } })
        },

        // 修改账号属性
        account_update_opts: {
            schema: {
                body: S.object()
                    .prop('user_id', S.integer().required())
                    .prop('key', S.string().minLength(1).required())
                    .prop('value', S.string().required())
            }
        },
        async account_update_put(request, reply) {
            const body = request.body
            const user_id = body.user_id
            const key = body.key
            const value = body.value
            const res = await service_member.updateFieldValue(user_id, key, value)
            return { flag: 'ok', data: res }
        },

        // 上下分
        account_update_score_opts: {
            schema: {
                body: S.object()
                    .prop('user_id', S.integer().required())
                    .prop('action', S.string().required())
            }
        },
        async account_update_score_put(request, reply) {
            const body = request.body
            const user_id = body.user_id
            const action = body.action
            // TODO:操作者ID
            const operator_id = 1
            const notes = "手动上下分"
            // return { flag: 'ok', data: body }

            // 法币 上下分
            const coinArr = ['btc', 'eth', 'usdt']
            for (let i = 0; i < coinArr.length; i++) {
                let symbol = coinArr[i].toLocaleLowerCase()
                if (Number(body[symbol]) > 0) {
                    let amount = Number(body[symbol])
                    let hash = ""
                    let to_address = ""
                    let wallet_type = symbol
                    let time = ""
                    // console.log(user_id, operator_id, action, amount, hash, to_address, wallet_type, notes, time)
                    let walletLogRes = await service_wallet_log.addLog(user_id, operator_id, action, amount, hash, to_address, wallet_type, notes, time)
                    if (action == "add") {
                        let walletUpdateRes = await service_wallet.updateAddSubAssetsAmount(user_id, symbol, amount, "+")
                    } else if (action == "sub") {
                        let walletUpdateRes = await service_wallet.updateAddSubAssetsAmount(user_id, symbol, amount, "-")
                    }
                }
            }
            // return { flag: 'ok', data: body }

            // 平台币 上下分
            const currencyPlatformRes = await service_currency_platform.list(0, 999)
            const currencyPlatformList = currencyPlatformRes.list
            for (let i = 0; i < currencyPlatformList.length; i++) {
                let symbol = currencyPlatformList[i].symbol.toLocaleLowerCase()
                if (Number(body[symbol]) > 0) {
                    let coin_amount = ""
                    let coin_type = ""
                    let platform_coin_amount = Number(body[symbol])
                    let platform_coin_type = symbol
                    await service_currency_platform_trade_log.addLog(user_id, operator_id, coin_amount, coin_type, platform_coin_amount, platform_coin_type, notes, action)
                    if (action == "add") {
                        let walletUpdateRes = await service_wallet.updateAddSubAssetsAmount(user_id, platform_coin_type, platform_coin_amount, "+")
                    } else if (action == "sub") {
                        let walletUpdateRes = await service_wallet.updateAddSubAssetsAmount(user_id, platform_coin_type, platform_coin_amount, "-")
                    }
                }
            }
            return { flag: 'ok', data: body }
        },

        // 给用户 审核身份 是否通过
        account_update_auth_opts: {
            schema: {
                body: S.object()
                    .prop('user_id', S.integer().required())
                    .prop('status', S.string().required())
                    .prop('failed_reason', S.string().required())
            }
        },
        async account_update_auth_put(request, reply) {
            const body = request.body
            const user_id = body.user_id
            const status = body.status
            const failed_reason = body.failed_reason
            const res = await service_auth.updateAuthStatus(user_id, status, failed_reason)
            return { flag: 'ok' }
        },
    },


    config: {
        // 查询-配置列表
        get_opts: {
            schema: {
                querystring: S.object()
                    .prop('page', S.integer())
                    .prop('size', S.integer())
            }
        },
        async get(request, reply) {
            const query = request.query
            const list = await service_config.list()
            return {
                flag: 'ok', data: {
                    list: list,
                }
            }
        },

        // 更新-配置
        put_opts: {
            schema: {
                body: S.object()
                    .prop('id', S.integer().required())
                    .prop('key', S.string().required())
                    .prop('value', S.string().required())
            }
        },
        async put(request, reply) {
            const body = request.body
            const id = body.id
            const key = body.key
            const value = body.value
            const res = await service_config.update(id, key, value)
            return { flag: 'ok', res }
        },

        // 新增-配置
        post_opts: {
            schema: {
                body: S.object()
                    .prop('key', S.string().minLength(1).required())
                    .prop('value', S.string().minLength(1).required())
            }
        },
        async post(request, reply) {
            const body = request.body
            const key = body.key
            const value = body.value
            const res = await service_config.insert(key, value)
            return { flag: 'ok', res }
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