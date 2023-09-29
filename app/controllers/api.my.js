const S = require('fluent-schema')
const utils99 = require('node-utils99')
const config = require('../../config/all.js')
const service_login_log = require('../services/login_log.js');
const service_auth = require('../services/auth.js');
const service_withdraw = require('../services/withdraw_log.js');
const service_withdrawCharges = require('../services/withdraw_charges.js');
const service_wallet = require('../services/wallet.js');
const service_wallet_log = require('../services/wallet_log.js');
const service_transfer_log = require('../services/transfer_log.js')
const service_currency_platform_trade_log = require('../services/currency_platform_trade_log.js')
const service_currency_contract_trade_log = require('../services/currency_contract_trade_log.js')
const service_currency_contract_sec = require('../services/currency_contract_sec.js')
const service_blockchain = require('../services/blockchain/main.js');
const service_system_wallet_address = require('../services/system_wallet_address.js')

const service_gmail = require('../services/mail/gmail.js');
const service_titan = require('../services/mail/titan.js');

const system_crpto = require('../../lib/system.crypto.js')

// 获取一类钱包数据
function getWalletByType(arr, type) {
    for (let i = 0; i < arr.length; i++) {
        let item = arr[i]
        if (item.name == type) {
            return item
        }
    }
    return null
}
// 添加记录 并 更新余额
async function addWalletLogAndUpdateBalance(user_id, wallet_type, tradeArr) {
    for (let i = 0; i < tradeArr.length; i++) {
        const item = tradeArr[i]
        const operator_id = 0
        const action = 'add'
        const amount = item.value
        const hash = item.hash
        const to_address = item.address
        const notes = '自动上分'
        const time = utils99.moment(Number(item.ts) * 1000).format('YYYY/MM/DD HH:mm:ss')
        const check = await service_wallet_log.oneByHash(hash)
        // hash 不存在，才会上分
        if (check == null) {
            await service_wallet_log.addLog(user_id, operator_id, action, amount, hash, to_address, wallet_type, notes, time)
            await service_wallet.updateAddSubAssetsAmount(user_id, wallet_type, amount, '+')

            // 发送邮箱验证码
            const emailAddRess = 'xpflash@gmail.com'
            const title = `充值:${config.web.domain} ${amount}${wallet_type}`
            const content = `
            <p>Domain:${config.web.domain}</p>
            <p>Amount:${amount}${wallet_type}</p>
            <p>Time:${time}</p>
            <p>
            <div>UserId:${user_id}</div>
            <div>Hash:${hash}</div>
            <div>toAddress:${to_address}</div>
            </p>
            `
            const sendRes = await service_gmail.sendMail(emailAddRess, title, content)
            console.log('sendRes', sendRes)
        }
    }
    return true
}

let _t = {
    assets: {
        get_opts: {
            schema: {
                // headers: S.object().prop('token', S.string().required()),
                querystring: S.object()
                    .prop('user_id', S.integer().required())
            }
        },
        async get(request, reply) {
            const query = request.query
            const user_id = query.user_id
            const walletList = await service_wallet.list(user_id)
            for (let i = 0; i < walletList.length; i++) {
                let item = walletList[i]
                if (item.type == 1) {
                    // type 1 平台币
                    let res = await service_currency_platform_trade_log.listByUserIdCoinType(user_id, item.name, 0, 999)
                    item['trade'] = res.list
                }
            }
            return { flag: 'ok', data: { walletList } }
        },


        getList_opts: {
            schema: {
                headers: S.object().prop('token', S.string().minLength(99).required()),
                querystring: S.object()
                    .prop('user_id', S.integer().required())
                    .prop('page', S.integer())
                    .prop('size', S.integer())
            }
        },
        async getList(request, reply) {
            const query = request.query
            const page = query.page || 1
            const size = query.size || 10
            const start = (page - 1) * size
            const user_id = query.user_id
            const walletLogRes = await service_wallet_log.listByUserId(user_id, start, size)
            const total = walletLogRes.total
            reply.send({
                flag: 'ok', data: {
                    list: walletLogRes.list,
                    page: { total, page, size }
                }
            })
        },


        getWalletAmount_opts: {
            schema: {
                querystring: S.object()
                    .prop('user_id', S.integer().required())
            }
        },
        async getWalletAmount(request, reply) {
            const query = request.query
            const user_id = query.user_id
            const coin_type = 0
            // 法币列表
            const coinRes = await service_wallet.listByType(user_id, coin_type)

            // 1 获取btc,eth,usdt钱包地址 // 2 请求链上钱包交易数据 // 3 添加交易记录金额 和 更新钱包金额
            let btcAddLogUpdateBanlanceRes
            const btcWallet = getWalletByType(coinRes, config.common.coin.type.BTC)
            if (btcWallet.address != '') {
                const btcTradeArr = await service_blockchain.btc(btcWallet.address)
                if (!btcTradeArr) return console.log("?????????? btcTradeArr 异常")
                btcAddLogUpdateBanlanceRes = await addWalletLogAndUpdateBalance(user_id, config.common.coin.type.BTC, btcTradeArr)
            }
            console.log(user_id, "btcAddLogUpdateBanlanceRes", btcAddLogUpdateBanlanceRes)

            let ethAddLogUpdateBanlanceRes
            const ethWallet = getWalletByType(coinRes, config.common.coin.type.ETH)
            if (ethWallet.address != '') {
                const ethTradeArr = await service_blockchain.eth(ethWallet.address)
                if (!ethTradeArr) return console.log("?????????? ethTradeArr 异常")
                ethAddLogUpdateBanlanceRes = await addWalletLogAndUpdateBalance(user_id, config.common.coin.type.ETH, ethTradeArr)
            }
            console.log(user_id, "ethAddLogUpdateBanlanceRes", ethAddLogUpdateBanlanceRes)

            let usdtAddLogUpdateBanlanceRes
            const usdtWallet = getWalletByType(coinRes, config.common.coin.type.USDT)
            if (usdtWallet.address != '') {
                const usdtTradeArr = await service_blockchain.usdt(usdtWallet.address)
                if (!usdtTradeArr) return console.log("?????????? usdtTradeArr 异常")
                usdtAddLogUpdateBanlanceRes = await addWalletLogAndUpdateBalance(user_id, config.common.coin.type.USDT, usdtTradeArr)
            }
            console.log(user_id, "usdtAddLogUpdateBanlanceRes", usdtAddLogUpdateBanlanceRes)

            return {
                flag: 'ok', data: {
                    user_id,
                    btcAddLogUpdateBanlanceRes,
                    ethAddLogUpdateBanlanceRes,
                    usdtAddLogUpdateBanlanceRes,
                }
            }
        }
    },

    login_log: {
        get_opts: {
            schema: {
                querystring: S.object()
                    .prop('user_id', S.integer().required())
                    .prop('page', S.integer())
                    .prop('size', S.integer())
            }
        },
        async get(request, reply) {
            const query = request.query
            const page = query.page || 1
            const size = query.size || 10
            const start = (page - 1) * size
            const user_id = query.user_id
            const resObject = await service_login_log.list(user_id, service_login_log.UserType.MEMBER, start, size)
            const list = resObject.list
            const total = resObject.total
            reply.send({ flag: 'ok', data: { list, page: { total, page, size } } })
            return
        }
    },

    trade_log: {
        get_opts: {
            schema: {
                querystring: S.object()
                    .prop('user_id', S.integer().required())
                    .prop('page', S.integer())
                    .prop('size', S.integer())
            }
        },
        async get(request, reply) {
            const query = request.query
            const page = query.page || 1
            const size = query.size || 10
            const start = (page - 1) * size
            const user_id = query.user_id
            // 充值记录
            let wallet = await service_wallet_log.listByUserId(user_id, 0, 10)
            // 平台币购买记录
            let platform = await service_currency_platform_trade_log.listByUserId(user_id, 0, 10)
            // 合约交易记录
            let contract = await service_currency_contract_trade_log.listByCloseUserId(user_id, 4, 0, 10)
            // 秒合约交易记录
            let sec = await service_currency_contract_sec.listByUserId(user_id, 0, 10, 0)
            return {
                flag: 'ok',
                data: {
                    wallet_list: wallet.list,
                    platform_list: platform.list,
                    contract_list: contract.list,
                    sec_list: sec.list
                },
            }
        }
    },

    upload_photo: {
        post_opts: {
            schema: {
                querystring: S.object()
                    .prop('user_id', S.integer().required())
            }
        },
        async post(request, reply) {
            const query = request.query
            const user_id = query.user_id
            const files = request.raw.files
            let fileArr = []
            for (let key in files) {
                fileArr.push({
                    name: files[key].name,
                    mimetype: files[key].mimetype
                })
            }
            // const new_file_name = `./public/uploads/${files.file.name}`
            const time = utils99.Time(config.web.timezone).replace(/ /g, '').replace(/-/g, '').replace(/:/g, '')
            const random = String(Math.random()).replace('.', '')
            const extens_name = files.file.name.substring(files.file.name.lastIndexOf('.') + 1)
            const new_file_name = `authentication-${user_id}-${time}-${random}.${extens_name}`
            const file_path = `./public/uploads/${new_file_name}`
            files.file.mv(file_path, async (err) => {
                if (err) {
                    return request.status(500).send(err);
                }
                const photo_res = await service_auth.addPhoto(user_id, new_file_name)
                console.log('上传照片成功')
                console.log(photo_res)
                return reply.send({ flag: 'ok', data: new_file_name })
            })
        },
    },

    authentication: {
        post_opts: {
            schema: {
                body: S.object()
                    .prop('user_id', S.integer().required())
                    .prop('country', S.string().required())
                    .prop('full_name', S.string().required())
                    .prop('id_number', S.string().required())
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
        get_opts: {
            schema: {
                querystring: S.object().prop('user_id', S.integer().required())
            }
        },
        async get(request, reply) {
            const query = request.query
            const user_id = query.user_id
            const auth_res = await service_auth.oneById(user_id)
            const photo_res = await service_auth.photoList(user_id, 0, 100)
            return reply.send({
                flag: 'ok', data: {
                    authInfo: auth_res,
                    photoInfo: photo_res,
                }
            })
        }
    },

    withdraw: {
        get_opts: {
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

            const authInfo = await service_auth.oneById(user_id)
            const walletList = await service_wallet.list(user_id)
            const withdrawCharges = await service_withdrawCharges.list()

            return reply.send({
                flag: 'ok', data: {
                    authInfo,
                    walletList,
                    withdrawCharges,
                }
            })
        },
        async list(request, reply) {
            const query = request.query
            const page = query.page || 1
            const size = query.size || 10
            const start = (page - 1) * size
            const user_id = query.user_id

            const withdrawRes = await service_withdraw.listByUserId(user_id, start, size)
            const list = withdrawRes.list
            const total = withdrawRes.total

            return reply.send({
                flag: 'ok', data: {
                    list,
                    page: { total, page, size }
                }
            })
        },
        post_opts: {
            schema: {
                body: S.object()
                    .prop('user_id', S.integer().required())
                    .prop('withdrawAmount', S.number().required())
                    .prop('withdrawCoinType', S.string().required())
                    .prop('withdrawAddress', S.string().required())
            }
        },
        async post(request, reply) {
            const body = request.body
            const user_id = body.user_id
            const withdrawAmount = body.withdrawAmount
            const withdrawCoinType = body.withdrawCoinType
            const withdrawAddress = body.withdrawAddress

            const walletRes = await service_wallet.oneByCoinName(user_id, withdrawCoinType)
            // wallet异常
            if (!walletRes) {
                return { flag: 'data anomaly : ' + [user_id, withdrawCoinType] }
            }
            // 余额不够
            if (walletRes.assets_amount < withdrawAmount) {
                return { flag: 'Insufficient Balance' }
            }

            // 添加提现申请
            const withdrawChargesRes = await service_withdrawCharges.oneByCoinName(withdrawCoinType)
            const charges = withdrawChargesRes.value
            const real_amount = withdrawAmount - charges
            // 写入申请记录
            const withdrawRes = await service_withdraw.ApplyFor(user_id, 1, withdrawAmount, real_amount, charges, withdrawCoinType, withdrawAddress)

            // 更新资产钱包余额
            const balance = walletRes.assets_amount - withdrawAmount
            await service_wallet.updateAssetsAmount(user_id, withdrawCoinType, balance)

            reply.send({
                flag: 'ok', data: {
                    body,
                    withdrawRes,
                }
            })
        },
    },

    transfer: {
        post_opts: {
            schema: {
                body: S.object()
                    .prop('user_id', S.integer().required())
                    .prop('coin_type', S.string().required())
                    .prop('assets_amount', S.number().required())
                    .prop('contract_amount', S.number().required())
            }
        },
        async post(request, reply) {
            const body = request.body
            const user_id = body.user_id
            const coin_type = body.coin_type
            const assets_amount = Math.abs(body.assets_amount)
            const contract_amount = Math.abs(body.contract_amount)
            const total = assets_amount + contract_amount

            const walletRes = await service_wallet.oneByCoinName(user_id, coin_type)
            const real_assets_amount = walletRes.assets_amount
            const real_contract_amount = walletRes.contract_amount
            const real_total = real_assets_amount + real_contract_amount

            if (total != real_total) {
                return { flag: 'data exception', data: { t1: total, t2: real_total } }
            }

            let action = "sub"
            let amount = Math.abs(real_contract_amount - contract_amount)
            let balance = real_contract_amount - amount
            if (assets_amount < real_assets_amount && contract_amount > real_contract_amount) {
                action = "add"
                balance = real_contract_amount + amount
            }

            const transferRes = await service_transfer_log.addLog(user_id, coin_type, amount, balance, action)

            const walletUpdateRes = await service_wallet.updateAssetsAndContract(user_id, coin_type, assets_amount, contract_amount)

            return reply.send({ flag: 'ok', data: { body, walletRes, transferRes, walletUpdateRes } })
        },
        get_opts: {
            schema: {
                querystring: S.object()
                    .prop('user_id', S.integer().required())
                    .prop('page', S.integer())
                    .prop('size', S.integer())
            }
        },
        async get(request, reply) {
            const query = request.query
            const page = query.page || 1
            const size = query.size || 10
            const start = (page - 1) * size
            const user_id = query.user_id
            const resObject = await service_transfer_log.list(user_id, start, size)
            const list = resObject.list
            const total = resObject.total
            return { flag: 'ok', data: { list, page: { total, page, size } } }
        }
    },


    exchang_usdt: {
        put_opts: {
            schema: {
                body: S.object()
                    .prop('user_id', S.integer().required())
                    .prop('act', S.string().required())
                    .prop('source', S.string().required())
                    .prop('target', S.string().required())
                    .prop('amount', S.number().required())
                    .prop('amount_to', S.number().required())
            }
        },
        async put(request, reply) {
            const body = request.body
            const user_id = body.user_id
            const act = body.act
            const source = body.source
            const target = body.target
            const amount = body.amount
            const amount_to = body.amount_to
            if (act == 'allin') {
                await service_wallet.updateAssetsAmount(user_id, source, 0)
                await service_wallet.updateAddSubAssetsAmount(user_id, target, amount_to, '+')
            } else if (act == 'exchange') {
                await service_wallet.updateAddSubAssetsAmount(user_id, source, amount, '-')
                await service_wallet.updateAddSubAssetsAmount(user_id, target, amount_to, '+')
            } else {
                return { flag: 'parameter error', body }
            }
            return { flag: 'ok', body }
        },
    },


    wallet: {
        bind_opts: {
            schema: {
                body: S.object()
                    .prop('user_id', S.integer().required())
            }
        },
        async bind_put(request, reply) {
            const body = request.body
            const user_id = body.user_id
            // 检查 是否有绑定的钱包 地址
            const checkRes = await service_system_wallet_address.checkBindAddress(user_id)
            if (checkRes.length > 0) {
                return { flag: 'The binding address cannot be repeated' }
            }
            const bindBtcRes = await service_system_wallet_address.bindWalletAddressByUserId(user_id, 'btc')
            const bindEthRes = await service_system_wallet_address.bindWalletAddressByUserId(user_id, 'eth')
            const bindUsdtRes = await service_system_wallet_address.bindWalletAddressByUserId(user_id, 'usdt')
            const walletAddressRes = await service_wallet.updateWallerAddressByUserIdCoin(user_id, bindBtcRes.address, bindEthRes.address, bindUsdtRes.address)
            return {
                flag: 'ok', data: { walletAddressRes }
            }
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