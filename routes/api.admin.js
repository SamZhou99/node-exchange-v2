const controlless = require('../app/controllers/api.admin.js')
const controlless_article = require('../app/controllers/admin/article.js')
const controlless_article_category = require('../app/controllers/admin/article.category.js')

const middleware = require('../app/middleware/index.js')
const system_crpto = require('../lib/system.crypto.js')

const ErrMsg = require('../lib/error.msg.js')

async function routes(fastify, options) {
    // 获取验证码
    fastify.get('/VerifyCode', controlless.verifyCode.get)
    // 查询-用户登录
    fastify.post('/login', controlless.login.post_opts, controlless.login.post)

    // 仪表盘
    fastify.get('/dashboard', controlless.dashboard.get_opts, controlless.dashboard.get)
    fastify.get('/dashboard/earning/search', controlless.dashboard.earning_get_opts, controlless.dashboard.earning_get)

    // 查询-用户列表
    fastify.get('/user-list', controlless.member.get_opts, controlless.member.get)

    // 查询-代理商列表
    fastify.get('/agent', controlless.agent.get_opts, controlless.agent.list)
    fastify.put('/agent', controlless.agent.put_opts, controlless.agent.update)
    fastify.post('/agent', controlless.agent.post_opts, controlless.agent.post)
    fastify.get('/agent/children-list', controlless.agent.children_list_opts, controlless.agent.children_list)
    fastify.get('/agent/item', controlless.agent.item_opts, controlless.agent.item)

    // 查询-网站基础配置
    fastify.get('/config-list', controlless.config.get_opts, controlless.config.get)
    // 更新-网站基础配置
    fastify.put('/config-list', controlless.config.put_opts, controlless.config.put)
    // 增加-网站基础配置
    fastify.post('/config-list', controlless.config.post_opts, controlless.config.post)

    // 充值记录
    fastify.get('/recharge-list', controlless.recharge.get_opts, controlless.recharge.get)
    // 更新 是否结算状态
    fastify.put('/recharge-list-item-status', controlless.recharge_item_status.put_opts, controlless.recharge_item_status.put)
    // 合约交易记录
    fastify.get('/recharge-contract-list', controlless.recharge_contract.get_opts, controlless.recharge_contract.get)
    // 秒合约交易记录
    fastify.get('/recharge-contract-list-sec', controlless.recharge_contract_sec.get_opts, controlless.recharge_contract_sec.get)


    // 查询-用户列表 账号自动完成
    fastify.post('/account/auto-complete', controlless.member.auto_complete_opts, controlless.member.auto_complete_post)
    // 更新-用户属性
    fastify.put('/account/update', controlless.member.account_update_opts, controlless.member.account_update_put)
    fastify.put('/account/delete', controlless.member.account_delete_opts, controlless.member.account_delete_put)
    // 更新-用户上下分
    fastify.put('/account/update-score', controlless.member.account_update_score_opts, controlless.member.account_update_score_put)
    // 更新-审核状态 用户身份认证
    fastify.put('/account/update-auth', controlless.member.account_update_auth_opts, controlless.member.account_update_auth_put)
    // 添加新用户
    fastify.post('/account/create', controlless.member.create_opts, controlless.member.create_post)
    // 管理端-修改密码
    fastify.put('/administrator/password-change', controlless.password_change.put_opts, controlless.password_change.put)


    // 钱包地址
    fastify.get('/wallet-address/upload', controlless.wallet.get_opts, controlless.wallet.get)
    fastify.post('/wallet-address/upload', controlless.wallet.upload_walletaddress_post)
    // 查询-钱包列表 钱包地址自动完成
    fastify.post('/wallet-address/auto-complete', controlless.wallet.auto_complete_opts, controlless.wallet.auto_complete_post)
    fastify.put('/wallet-address/unbind', controlless.wallet.unbind_opts, controlless.wallet.unbind_put)


    // 用户提现
    fastify.get('/withdraw', controlless.withdraw.get_opts, controlless.withdraw.get)
    // 用户提现修改状态
    fastify.put('/withdraw', controlless.withdraw.put_opts, controlless.withdraw.put)
    // 提现手续费
    fastify.get('/withdraw-charges', controlless.withdraw_charges.get_opts, controlless.withdraw_charges.get)
    fastify.put('/withdraw-charges', controlless.withdraw_charges.put_opts, controlless.withdraw_charges.put)



    // 上传任何图片
    fastify.post('/upload/image', controlless.upload_image.post_opts, controlless.upload_image.post)

    // 某一个平台币
    fastify.get('/currency-platform/item', controlless.currency_platform.getItem_opts, controlless.currency_platform.getItem)
    // 更新-平台币信息
    fastify.put('/currency-platform/item', controlless.currency_platform.putItem_opts, controlless.currency_platform.putItem)
    // 增加-平台币
    fastify.post('/currency-platform', controlless.currency_platform.post_opts, controlless.currency_platform.post)
    // 更新-平台币简介文档
    fastify.get('/currency-platform/item-desc', controlless.currency_platform.getItemDesc_opts, controlless.currency_platform.getItemDesc)
    fastify.put('/currency-platform/item-desc', controlless.currency_platform.putItemDesc_opts, controlless.currency_platform.putItemDesc)


    // 某一个合约币
    fastify.get('/currency-contract/item', controlless.currency_contract.getItem_opts, controlless.currency_contract.getItem)
    // 更新-合约币信息
    fastify.put('/currency-contract/item', controlless.currency_contract.putItem_opts, controlless.currency_contract.putItem)
    // 增加-合约币
    fastify.post('/currency-contract', controlless.currency_contract.post_opts, controlless.currency_contract.post)

    // 秒合约币
    // fastify.get('/currency-contract-sec/item', controlless.currency_contract.getItem_opts, controlless.currency_contract.getItem)
    // 修改订单 控制输赢
    fastify.put('/currency-contract-sec/item/order', controlless.currency_contract_sec.putItem_opts, controlless.currency_contract_sec.putItem)
    // fastify.post('/currency-contract-sec', controlless.currency_contract.post_opts, controlless.currency_contract.post)

    // Banner相关
    fastify.get('/banner', controlless.banner.get_opts, controlless.banner.get)
    fastify.post('/banner', controlless.banner.post_opts, controlless.banner.post)
    fastify.put('/banner', controlless.banner.put_opts, controlless.banner.put)
    fastify.delete('/banner', controlless.banner.delete_opts, controlless.banner.delete)

    // 文章相关
    fastify.get('/article', controlless_article.get_opts, controlless_article.get)
    fastify.get('/article/item', controlless_article.getItem_opts, controlless_article.getItem)
    fastify.post('/article', controlless_article.post_opts, controlless_article.post)
    fastify.put('/article', controlless_article.put_opts, controlless_article.put)
    fastify.delete('/article', controlless_article.delete_opts, controlless_article.delete)
    // 文章分类相关
    fastify.get('/article/category', controlless_article_category.get_opts, controlless_article_category.get)
    fastify.post('/article/category', controlless_article_category.post_opts, controlless_article_category.post)
    fastify.put('/article/category', controlless_article_category.put_opts, controlless_article_category.put)
    fastify.delete('/article/category', controlless_article_category.delete_opts, controlless_article_category.delete)



    // PageView记录
    fastify.get('/pv-log', controlless.pv_log.get_opts, controlless.pv_log.get)
    fastify.delete('/pv-log', controlless.pv_log.get_opts, controlless.pv_log.delete)







    // // 上传照片
    // fastify.post('/upload-photo', controlless.upload_photo.post_opts, controlless.upload_photo.post)

    // 中间件
    // fastify.use(['/api/admin/dashboard', '/user-list'], middleware.test)



    // const EXCLUDE_ARR = ['/api/admin/VerifyCode', '/api/admin/login']
    // fastify.addHook('preHandler', (request, reply, done) => {
    //     // 排除
    //     let url = request.url
    //     for (let i = 0; i < EXCLUDE_ARR.length; i++) {
    //         let item = EXCLUDE_ARR[i]
    //         if (url.indexOf(item) != -1) {
    //             done()
    //             return
    //         }
    //     }


    //     // 解密 token
    //     let token = request.query.token || request.body.token

    //     if (token == undefined) {
    //         reply.code(400)
    //         done(new Error(ErrMsg.TOKEN_NOT_FOUND.code))
    //         return
    //     }

    //     // 解密是否错误
    //     let result
    //     try {
    //         result = system_crpto.decryption(token)
    //     } catch (err) {
    //         reply.code(400)
    //         done(new Error(ErrMsg.TOKEN_DECRYPTION_ERROR.code))
    //         return
    //     }

    //     // console.log("其他代码", request.url, result)
    //     result = JSON.parse(result)
    //     if (result.id == result.account) {
    //         // 检查ID和账号
    //     }
    //     if (result.status == 0) {
    //         // 状态不对
    //         reply.code(400)
    //         done(new Error(ErrMsg.TOKEN_STATUS_ERROR.code))
    //         return
    //     }
    //     if (result.ip) {
    //         // // 安全检查
    //         // reply.code(400)
    //         // done(new Error('OMG'))
    //         // return
    //     }
    //     if (new Date().getTime() - result.ts > 86400000) {
    //         // 是否有超时
    //         // console.log("\n是否有超时", result.ts, new Date().getTime(), new Date().getTime() - result.ts > 86400000)
    //         reply.code(400)
    //         done(new Error(ErrMsg.TOKEN_AUTH_TIMEOUT.code))
    //         return
    //     }
    //     done()
    // })
}

module.exports = routes

// fastify.get(path, [options], handler)
// fastify.head(path, [options], handler)
// fastify.post(path, [options], handler)
// fastify.put(path, [options], handler)
// fastify.delete(path, [options], handler)
// fastify.options(path, [options], handler)
// fastify.patch(path, [options], handler)
// fastify.all(path, [options], handler)