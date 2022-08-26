const S = require('fluent-schema')
const utils99 = require('node-utils99')
const config = require('../../config/all.js')
const service_currency_platform = require('../services/currency_platform.js');
const service_currency_platform_trade_log = require('../services/currency_platform_trade_log.js');
const service_currency_contract = require('../services/currency_contract.js');
const service_currency_contract_trade_log = require('../services/currency_contract_trade_log.js');
const service_auth = require('../services/auth.js');
const service_withdraw = require('../services/withdraw_log.js');
const service_withdrawCharges = require('../services/withdraw_charges.js');
const service_wallet = require('../services/wallet.js');
const service_wallet_log = require('../services/wallet_log.js');
const service_system_wallet_address = require('../services/system_wallet_address.js');
const service_config = require('../services/config.js')
const service_member = require('../services/member.js')
const service_agent = require('../services/agent.js')
const service_admin = require('../services/admin.js')
const service_login_log = require('../services/login_log.js')
const service_system_session = require('../services/system_session.js')
const service_system_banner = require('../services/system_banner.js')
const service_system_pv_log = require('../services/system_pv_log.js')
const service_kline_history = require('../services/kline_history.js')


const verifyCode = require('../../lib/verify.code.js')
const textToImage = require('text-to-image');
const systemCrypto = require('../../lib/system.crypto.js')



let _t = {
    verifyCode: {
        async get(request, reply) {
            const ip = request.headers['x-real-ip'] || request.ip
            const code = verifyCode.create(ip)
            const n1 = verifyCode.randomInt(code * 0.5, code * 0.8)
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

            const token = systemCrypto.encryption(JSON.stringify({
                id: user.id,
                account: user.account,
                type: user.type,
                agent_id: user.agent_id,
                status: user.status,
                ip: IP,
                ts: new Date().getTime()
            }))

            return {
                flag: 'ok', data: { token }
            }
        },
    },

    dashboard: {
        get_opts: {
            schema: {
                querystring: S.object()
                // .prop('size', S.integer())
                // .prop('type', S.string().minLength(1).required())
            }
        },
        async get(request, reply) {
            const query = request.query

            const Users = await service_member.lastMember(5)
            const Agents = await service_agent.list(0, 5)
            const Earning = await service_wallet_log.listDashboard(0, 5)
            const btc = await service_system_wallet_address.walletUseTotal('btc')
            const eth = await service_system_wallet_address.walletUseTotal('eth')
            const usdt = await service_system_wallet_address.walletUseTotal('usdt')

            for (let i = 0; i < Users.length; i++) {
                let item = Users[i]
                let btc = await service_wallet_log.sumByUserIdCoinName(item.id, 'btc')
                let eth = await service_wallet_log.sumByUserIdCoinName(item.id, 'eth')
                let usdt = await service_wallet_log.sumByUserIdCoinName(item.id, 'usdt')
                item.pay_sum = { btc, eth, usdt }
            }

            for (let i = 0; i < Earning.length; i++) {
                let item = Earning[i]
                item.user = await service_member.oneById(item.user_id)
            }

            return {
                flag: 'ok', data: {
                    Users: Users,
                    Agents: Agents.list,
                    Earning: Earning,
                    Wallet: {
                        btc, eth, usdt
                    },
                }
            }
        }
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

        // 无需邮箱验证，添加新用户
        create_opts: {
            schema: {
                body: S.object()
                    .prop('account', S.string().minLength(1).required())
                    .prop('password', S.string().minLength(1).required())
                    .prop('notes', S.string().minLength(1).required())
                    .prop('btc_address', S.string().minLength(1).required())
                    .prop('eth_address', S.string().minLength(1).required())
                    .prop('usdt_address', S.string().minLength(1).required())
            }
        },
        async create_post(request, reply) {
            const body = request.body
            const agent_id = 0
            const account = body.account
            const password = body.password
            const notes = body.notes
            const ip = request.headers['x-real-ip'] || request.ip
            const type = 1
            const status = 1
            const email_verify = 1
            const btc_address = body.btc_address
            const eth_address = body.eth_address
            const usdt_address = body.usdt_address

            const checkRes = await service_member.oneByAccount(account)
            if (checkRes != null) {
                return { flag: '创建失败，邮箱账号重复！' }
            }

            // 创建帐户
            const createMemberRes = await service_member.createMember(agent_id, account, utils99.MD5(password), notes, type, status, email_verify, ip)
            console.log(createMemberRes)
            // 账户关联的钱包和地址
            const newUserId = createMemberRes.insertId
            // // 给用户绑定一个钱包地址 【不绑定系统钱包，节省钱包地址】
            // const btc = await service_syste_wallet_address.updateWalletAddressByUserId(newUserId, 'btc')
            // const eth = await service_syste_wallet_address.updateWalletAddressByUserId(newUserId, 'eth')
            // const usdt = await service_syste_wallet_address.updateWalletAddressByUserId(newUserId, 'usdt')
            // 给我的资产中添加钱包地址
            await service_wallet.addWallet(newUserId, 0, 0, 0, 'btc', btc_address)
            await service_wallet.addWallet(newUserId, 0, 0, 0, 'eth', eth_address)
            await service_wallet.addWallet(newUserId, 0, 0, 0, 'usdt', usdt_address)
            const platformRes = await service_currency_platform.list(0, 999)
            const platformList = platformRes.list
            for (let i = 0; i < platformList.length; i++) {
                let item = platformList[i]
                await service_wallet.addWallet(newUserId, 1, 0, 0, item.symbol.toLocaleLowerCase(), '')
            }

            return { flag: 'ok' }
        },

        // 用户列表
        get_opts: {
            schema: {
                querystring: S.object()
                    .prop('page', S.integer())
                    .prop('size', S.integer())
                    .prop('type', S.string().minLength(1).required())
                    .prop('target_user_id', S.integer())
            }
        },
        async get(request, reply) {
            const query = request.query
            const page = query.page || 1
            const size = query.size || 10
            const start = (page - 1) * size
            const type = query.type
            const target_user_id = query.target_user_id
            const res = await service_member.listDetail(type, target_user_id, start, size)
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
            let value = body.value
            if (key == 'password') {
                value = utils99.MD5(value)
            }
            const res = await service_member.updateFieldValue(user_id, key, value)
            return { flag: 'ok', data: res }
        },

        // 修改账号属性
        account_delete_opts: {
            schema: {
                body: S.object()
                    .prop('user_id', S.integer().required())
            }
        },
        async account_delete_put(request, reply) {
            const body = request.body
            const user_id = body.user_id
            const key = 'deleted'
            const value = 1
            const updateDelStatusRes = await service_member.updateFieldValue(user_id, key, value)
            const unbindAddressRes = await service_system_wallet_address.unbindByUserId(user_id)
            const walletAddressRes = await service_wallet.updateWalletAddressByUserId(user_id)
            return { flag: 'ok', data: { updateDelStatusRes, unbindAddressRes, walletAddressRes } }
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
                    let time = utils99.Time(config.web.timezone)
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

    agent: {
        get_opts: {
            schema: {
                querystring: S.object()
                    .prop('page', S.integer())
                    .prop('size', S.integer())
            }
        },
        async list(request, reply) {
            const query = request.query
            const page = query.page || 1
            const size = query.size || 10
            const start = (page - 1) * size
            let res = await service_agent.list(start, size)
            let list = res.list
            let total = res.total
            for (let i = 0; i < list.length; i++) {
                let item = list[i]
                item.childrenCount = await service_member.countByAgentId(item.id)
            }
            return {
                flag: 'ok', data: {
                    list: list,
                    page: { total, page, size }
                }
            }
        },

        children_list_opts: {
            schema: {
                querystring: S.object()
                    .prop('id', S.integer().required())
                    .prop('page', S.integer())
                    .prop('size', S.integer())
            }
        },
        async children_list(request, reply) {
            const query = request.query
            const id = query.id
            const page = query.page || 1
            const size = query.size || 10
            const start = (page - 1) * size
            let res = await service_member.listByAgentId(id, start, size)
            let list = res.list
            let total = res.total
            for (let i = 0; i < list.length; i++) {
                let item = list[i]
                item.btc_total = await service_wallet_log.sumByUserIdCoinName(item.id, 'btc')
                item.eth_total = await service_wallet_log.sumByUserIdCoinName(item.id, 'eth')
                item.usdt_total = await service_wallet_log.sumByUserIdCoinName(item.id, 'usdt')
            }
            return {
                flag: 'ok', data: {
                    list: list,
                    page: { total, page, size }
                }
            }
        },

        item_opts: {
            schema: {
                querystring: S.object()
                    .prop('id', S.integer().required())
            }
        },
        async item(request, reply) {
            const query = request.query
            const id = query.id
            let res = await service_agent.oneById(id)
            return {
                flag: 'ok', data: res
            }
        },

        put_opts: {
            schema: {
                body: S.object()
                    .prop('agent_id', S.integer().required())
                    .prop('key', S.string().minLength(1).required())
                    .prop('value', S.string().minLength(1).required())
            }
        },
        async update(request, reply) {
            const body = request.body
            const agent_id = body.agent_id
            const key = body.key
            const value = body.value
            const updateRes = await service_agent.update(agent_id, key, value)
            return { flag: 'ok', data: updateRes }
        },

        post_opts: {
            schema: {
                body: S.object()
                    .prop('account', S.string().minLength(1).required())
                    .prop('password', S.string().minLength(1).required())
                    .prop('notes', S.string().minLength(1).required())
                    .prop('status', S.integer().required())
            }
        },
        async post(request, reply) {
            const body = request.body
            const account = body.account
            const password = utils99.MD5(body.password)
            const notes = body.notes
            const invite_code = await service_agent.randomCode()
            const type = 0
            const status = body.status
            const res = await service_agent.add(account, password, notes, invite_code, type, status)
            return { flag: 'ok', data: res }
        },
    },

    recharge: {
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
            const res = await service_wallet_log.list(start, size)
            for (let i = 0; i < res.list.length; i++) {
                let item = res.list[i]
                item.member = await service_member.oneById(item.user_id)
                item.operator = await service_admin.oneById(item.operator_id)
            }
            const list = res.list
            const total = res.total
            return {
                flag: 'ok', data: { list, page: { total, page, size } }
            }
        },
    },

    recharge_contract: {
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
            const res = await service_currency_contract_trade_log.list(start, size)
            const total = res.total
            let list = res.list
            for (let i = 0; i < list.length; i++) {
                let item = list[i]
                item.user = await service_member.oneById(item.user_id)
            }
            return {
                flag: 'ok', data: { list, page: { total, page, size } }
            }
        },
    },

    wallet: {
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
            let res = await service_system_wallet_address.list(start, size)
            let list = res.list
            let total = res.total
            for (let i = 0; i < list.length; i++) {
                let item = list[i]
                if (item.upload_user_id > 0) {
                    item.uploader = await service_admin.oneById(item.upload_user_id)
                }
                if (item.bind_user_id > 0) {
                    item.binder = await service_member.oneById(item.bind_user_id)
                }
            }
            return {
                flag: 'ok', data: {
                    list: list,
                    page: { total, page, size }
                }
            }
        },


        upload_walletaddress_opts: {
            schema: {
                body: S.object()
                    .prop('list', S.array().required())
            }
        },
        async upload_walletaddress_post(request, reply) {
            const body = request.body
            const list = body['list[]']
            const res = await service_system_wallet_address.importWalletAddress(list)
            return { flag: 'ok', data: res }
        },

        auto_complete_opts: {
            schema: {
                body: S.object()
                    .prop('address', S.string().required())
            }
        },
        async auto_complete_post(request, reply) {
            const body = request.body
            const address = body.address
            const limit = body.limit || 5
            const res = await service_system_wallet_address.listByAddress(address, limit)
            return {
                flag: 'ok', data: {
                    list: res
                }
            }
        },


        unbind_opts: {
            schema: {
                body: S.object()
                    .prop('user_id', S.integer().required())
            }
        },
        async unbind_put(request, reply) {
            const body = request.body
            const user_id = body.user_id
            const unbindAddressRes = await service_system_wallet_address.unbindByUserId(user_id)
            const walletAddressRes = await service_wallet.updateWalletAddressByUserId(user_id)
            return { flag: 'ok', data: { unbindAddressRes, walletAddressRes } }
        },
    },

    withdraw: {
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
            const res = await service_withdraw.list(start, size)
            const total = res.total
            let list = res.list
            for (let i = 0; i < list.length; i++) {
                let item = list[i]
                item.user = await service_member.oneById(item.user_id)
            }
            return {
                flag: 'ok', data: {
                    list,
                    page: {
                        total,
                        page,
                        size
                    }
                }
            }
        },

        put_opts: {
            schema: {
                body: S.object()
                    .prop('id', S.integer().required())
                    .prop('status', S.integer().required())
                    .prop('failed_reason', S.string().required())
            }
        },
        async put(request, reply) {
            const body = request.body
            const id = body.id
            const status = body.status
            const failed_reason = body.failed_reason

            const oneRes = await service_withdraw.oneById(id)
            if (!oneRes) {
                // 参数异常
                return { flag: '参数异常！' }
            }
            if (oneRes.status == '2') {
                // 不要重复驳回 否则 会多给出金额数量到用户钱包
                return { flag: '已经是驳回状态，不能再次修改！' }
            }

            const updateStatusRes = await service_withdraw.updateStatusReason(oneRes.id, status, failed_reason)
            let updateUserWalletAmountRes
            if (status == '2') {
                // 驳回状态时=2 返还申请数量
                updateUserWalletAmountRes = await service_wallet.updateAddSubAssetsAmount(oneRes.user_id, oneRes.type, oneRes.apply_amount, '+')
            }

            return {
                flag: 'ok', data: {
                    oneRes,
                    updateStatusRes,
                    updateUserWalletAmountRes,
                }
            }
        },
    },

    withdraw_charges: {
        get_opts: {
            schema: {
                querystring: S.object()
                // .prop('page', S.integer())
                // .prop('size', S.integer())
            }
        },
        async get(request, reply) {
            const query = request.query
            const res = await service_withdrawCharges.list()
            return {
                flag: 'ok', data: res
            }
        },

        put_opts: {
            schema: {
                body: S.object()
                    .prop('id', S.integer().required())
                    .prop('key', S.string().minLength(1).required())
                    .prop('value', S.string().minLength(1).required())
            }
        },
        async put(request, reply) {
            const body = request.body
            const id = body.id
            const key = body.key
            const value = body.value
            const res = await service_withdrawCharges.updateFieldValue(id, key, value)
            return { flag: 'ok', data: res }
        },
    },

    upload_image: {
        post_opts: {
            schema: {
                querystring: S.object()
                    .prop('prefix', S.string().minLength(1).required())
                    .prop('id', S.integer().required())
            }
        },
        async post(request, reply) {
            const query = request.query
            const prefix = query.prefix
            const files = request.raw.files
            let fileArr = []
            for (let key in files) {
                fileArr.push({
                    name: files[key].name,
                    mimetype: files[key].mimetype
                })
            }
            const time = utils99.Time(config.web.timezone).replace(/ /g, '').replace(/-/g, '').replace(/:/g, '')
            const random = String(Math.random()).replace('.', '')
            const extens_name = files.file.name.substring(files.file.name.lastIndexOf('.') + 1)
            const new_file_name = `${prefix}-${time}-${random}.${extens_name}`
            const file_path = `./public/uploads/${new_file_name}`
            files.file.mv(file_path, async (err) => {
                if (err) {
                    return request.status(500).send(err);
                }
                return reply.send({ flag: 'ok', data: { id: query.id, name: new_file_name } })
            })
        },
    },

    currency_platform: {
        getItem_opts: {
            schema: {
                querystring: S.object()
                    .prop('id', S.integer().required())
            }
        },
        async getItem(request, reply) {
            const query = request.query
            const id = query.id
            let res = await service_currency_platform.oneById(id)
            delete res.desc
            delete res.abstract
            return { flag: 'ok', data: res }
        },

        putItem_opts: {
            schema: {
                body: S.object()
                    .prop('id', S.integer().required())
                    .prop('icon', S.string().minLength(1).required())
                    .prop('symbol', S.string().minLength(1).required())
                    .prop('name', S.string().minLength(1).required())
                    .prop('value', S.number().required())
                    .prop('sell_value', S.number().required())
                    .prop('withdraw_charges', S.number().required())
                    .prop('usdt_exchange', S.number().required())
                    .prop('sort', S.integer().required())
                    // .prop('abstract', S.string().minLength(1).required())
                    // .prop('desc', S.string().minLength(1).required())
                    .prop('is_show', S.integer().required())
                    .prop('start_time', S.string().minLength(1).required())
                    .prop('end_time', S.string().minLength(1).required())
            }
        },
        async putItem(request, reply) {
            const body = request.body
            const id = body.id
            const icon = body.icon.trim()
            const symbol = body.symbol.trim()
            const name = body.name.trim()
            const value = body.value
            const sell_value = body.sell_value
            const withdraw_charges = body.withdraw_charges
            const usdt_exchange = body.usdt_exchange
            const sort = body.sort
            // const abstract = body.abstract || ''
            // const desc = body.desc || ''
            const is_show = body.is_show
            const start_time = body.start_time
            const end_time = body.end_time

            // 更新 钱包平台币名称
            const oldRes = await service_currency_platform.oneById(id)
            if (oldRes != null && oldRes.name.toLowerCase() != symbol.toLowerCase()) {
                // 我的资产 钱包名称
                await service_wallet.updateNameByName(oldRes.name.toLowerCase(), symbol.toLowerCase())
                // kline历史币名称
                await service_kline_history.updateNameByName(oldRes.name.toLowerCase() + "usdt", symbol.toLowerCase() + "usdt")
                // 交易记录名称
                await service_currency_platform_trade_log.updateNameByName(oldRes.name.toLowerCase() + "usdt", symbol.toLowerCase() + "usdt")
            }

            // 更新 平台币信息
            const res = await service_currency_platform.update(id, icon, symbol, name, value, sell_value, withdraw_charges, usdt_exchange, sort, is_show, start_time, end_time)
            return { flag: 'ok', data: res }
        },

        post_opts: {
            schema: {
                body: S.object()
                    .prop('icon', S.string().minLength(1).required())
                    .prop('symbol', S.string().minLength(1).required())
                    .prop('name', S.string().minLength(1).required())
                    .prop('value', S.number().required())
                    .prop('sell_value', S.number().required())
                    .prop('withdraw_charges', S.number().required())
                    .prop('usdt_exchange', S.number().required())
                    .prop('sort', S.integer().required())
                    // .prop('abstract', S.string().required())
                    // .prop('desc', S.string().required())
                    .prop('is_show', S.integer().required())
                    .prop('start_time', S.string().minLength(1).required())
                    .prop('end_time', S.string().minLength(1).required())
            }
        },
        async post(request, reply) {
            const body = request.body
            const icon = body.icon
            const symbol = body.symbol
            const name = body.name
            const value = body.value
            const sell_value = body.sell_value
            const withdraw_charges = body.withdraw_charges
            const usdt_exchange = body.usdt_exchange
            const sort = body.sort
            const abstract = body.abstract || '-'
            const desc = body.desc || '-'
            const is_show = body.is_show
            const start_time = body.start_time
            const end_time = body.end_time

            const oldRes = await service_currency_platform.oneBySymbol(symbol.toLowerCase())
            if (oldRes) {
                return { flag: '新添加的平台币名称，不能有相同的！请更换其他名称。' }
            }

            // 给所有用户的，钱包，添加平台币
            const memberListRes = await service_member.list(0, 9999)
            for (let i = 0; i < memberListRes.list.length; i++) {
                let user_id = memberListRes.list[i].id
                let type = 1
                let assets_amount = 0
                let contract_amount = 0
                let name = symbol.toLowerCase()
                let address = ''
                await service_wallet.addWallet(user_id, type, assets_amount, contract_amount, name, address)
            }

            // 添加平台币
            const res = await service_currency_platform.add(icon, symbol, name, value, sell_value, withdraw_charges, usdt_exchange, sort, abstract, desc, is_show, start_time, end_time)

            return { flag: 'ok', data: res }
        },





        getItemDesc_opts: {
            schema: {
                querystring: S.object()
                    .prop('id', S.integer().required())
            }
        },
        async getItemDesc(request, reply) {
            const query = request.query
            const id = query.id
            let res = await service_currency_platform.oneById(id)
            return {
                flag: 'ok', data: {
                    desc: res.desc,
                    abstract: res.abstract,
                }
            }
        },
        putItemDesc_opts: {
            schema: {
                body: S.object()
                    .prop('id', S.integer().required())
                    .prop('abstract', S.string().minLength(1).required())
                    .prop('desc', S.string().minLength(1).required())
            }
        },
        async putItemDesc(request, reply) {
            const body = request.body
            const id = body.id
            const abstract = body.abstract
            const desc = body.desc
            await service_currency_platform.updateDesc(id, abstract, desc)
            return { flag: 'ok' }
        },
    },

    currency_contract: {
        getItem_opts: {
            schema: {
                querystring: S.object()
                    .prop('id', S.integer().required())
            }
        },
        async getItem(request, reply) {
            const query = request.query
            const id = query.id
            let res = await service_currency_contract.oneById(id)
            return { flag: 'ok', data: res }
        },

        putItem_opts: {
            schema: {
                body: S.object()
                    .prop('id', S.integer().required())
                    .prop('icon', S.string().minLength(1).required()) // 图标
                    .prop('symbol', S.string().minLength(1).required()) // 大写交易对
                    .prop('name', S.string().minLength(1).required()) // 小写名称
                    .prop('charges', S.number().required()) // 手续费
                    .prop('amount', S.number().required()) // 最少买几手
                    .prop('close_a_position', S.number().required()) // 平仓风险率
                    .prop('sort', S.integer()) // 排序
                    .prop('is_show', S.integer()) // 是否显示
            }
        },
        async putItem(request, reply) {
            const body = request.body
            const id = body.id
            const icon = body.icon
            const symbol = body.symbol
            const name = body.name
            const charges = body.charges
            const amount = body.amount
            const close_a_position = body.close_a_position
            const sort = body.sort
            const is_show = body.is_show
            const res = await service_currency_contract.update(id, icon, symbol, name, charges, amount, close_a_position, sort, is_show)
            return { flag: 'ok', data: res }
        },

        post_opts: {
            schema: {
                body: S.object()
                    .prop('icon', S.string().minLength(1).required()) // 图标
                    .prop('symbol', S.string().minLength(1).required()) // 大写交易对
                    .prop('name', S.string().minLength(1).required()) // 小写名称
                    .prop('charges', S.number().required()) // 手续费
                    .prop('amount', S.number().required()) // 最少买几手
                    .prop('close_a_position', S.number().required()) // 平仓风险率
                    .prop('sort', S.integer()) // 排序
                    .prop('is_show', S.integer()) // 是否显示
            }
        },
        async post(request, reply) {
            const body = request.body
            const icon = body.icon
            const symbol = body.symbol
            const name = body.name
            const charges = body.charges
            const amount = body.amount
            const close_a_position = body.close_a_position
            const sort = body.sort
            const is_show = body.is_show
            const res = await service_currency_contract.add(icon, symbol, name, charges, amount, close_a_position, sort, is_show)
            return { flag: 'ok', data: res }
        }
    },

    password_change: {
        put_opts: {
            schema: {
                body: S.object()
                    .prop('id', S.integer().required())
                    .prop('old_password', S.string().minLength(1).required())
                    .prop('new_password', S.string().minLength(1).required())
                    .prop('rep_new_password', S.string().minLength(1).required())
            }
        },
        async put(request, reply) {
            const body = request.body
            const id = body.id
            const old_password = utils99.MD5(body.old_password)
            const new_password = body.new_password
            const rep_new_password = body.rep_new_password
            const status = 1
            if (new_password != rep_new_password) {
                return { flag: '新密码两次输入不一致！' }
            }
            const res = await service_admin.oneByIdPassword(id, old_password, status)
            if (res == null) {
                return { flag: '旧密码不正确！' }
            }
            const updateRes = await service_admin.updatePassword(id, utils99.MD5(new_password))
            return { flag: 'ok', data: updateRes }
        },
    },

    banner: {
        get_opts: {
            schema: {
                querystring: S.object()
                    .prop('type', S.integer())
            }
        },
        async get(request, reply) {
            const query = request.query
            const type = query.type
            let res = await service_system_banner.list(type)
            return { flag: 'ok', data: res }
        },


        post_opts: {
            schema: {
                body: S.object()
                    .prop('type', S.integer().required())
                    .prop('sort', S.integer().required())
                    .prop('img', S.string().minLength(1).required())
            }
        },
        async post(request, reply) {
            const body = request.body
            const type = body.type
            const sort = body.sort
            const img = body.img
            const res = await service_system_banner.add(img, sort, type)
            return { flag: 'ok', data: res }
        },


        put_opts: {
            schema: {
                body: S.object()
                    .prop('id', S.integer().required())
                    .prop('img', S.string().minLength(1).required())
                    .prop('sort', S.string().minLength(1).required())
            }
        },
        async put(request, reply) {
            const body = request.body
            const id = body.id
            const img = body.img
            const sort = body.sort
            const res = await service_system_banner.updateById(id, img, sort)
            return { flag: 'ok', data: res }
        },


        delete_opts: {
            schema: {
                body: S.object()
                    .prop('id', S.integer().required())
            }
        },
        async delete(request, reply) {
            const body = request.body
            const id = body.id
            const res = await service_system_banner.deleteById(id)
            return { flag: 'ok', data: res }
        },
    },

    pv_log: {
        get_opts: {
            schema: {
                querystring: S.object()
                    .prop('page', S.integer())
                    .prop('size', S.integer())
                    .prop('target_user_id', S.integer())
            }
        },
        async get(request, reply) {
            const query = request.query
            const page = query.page || 1
            const size = query.size || 10
            const start = (page - 1) * size
            const target_user_id = query.target_user_id
            let res = await service_system_pv_log.list(target_user_id, start, size)
            for (let i = 0; i < res.list.length; i++) {
                let item = res.list[i]
                item['user'] = await service_member.oneById(item.user_id)
            }
            return {
                flag: 'ok', data: {
                    list: res.list,
                    page: { total: res.total, page, size }
                }
            }

        },


        async delete(request, reply) {
            let res = await service_system_pv_log.clearBeforeMonth()
            return { flag: 'ok', data: res }
        }
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