const controlless = require('../app/controllers/api.admin.js')
// const middleware = require('../app/middleware/index.js')

async function routes(fastify, options) {
    // 获取验证码
    fastify.get('/VerifyCode', controlless.verifyCode.get)
    // 查询-用户登录
    fastify.post('/login', controlless.login.post_opts, controlless.login.post)

    // 仪表盘
    fastify.get('/dashboard', controlless.dashboard.get_opts, controlless.dashboard.get)

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
    // 合约交易记录
    fastify.get('/recharge-contract-list', controlless.recharge_contract.get_opts, controlless.recharge_contract.get)


    // 查询-用户列表 账号自动完成
    fastify.post('/account/auto-complete', controlless.member.auto_complete_opts, controlless.member.auto_complete_post)
    // 更新-用户属性
    fastify.put('/account/update', controlless.member.account_update_opts, controlless.member.account_update_put)
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

    // 用户提现
    fastify.get('/withdraw', controlless.withdraw.get_opts, controlless.withdraw.get)
    // fastify.get('/withdraw/item', controlless.withdraw.item_opts, controlless.withdraw.item)
    // 用户提现修改状态
    fastify.put('/withdraw', controlless.withdraw.put_opts, controlless.withdraw.put)


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










    // // 上传照片
    // fastify.post('/upload-photo', controlless.upload_photo.post_opts, controlless.upload_photo.post)

    // 中间件
    // fastify.use(['/json', '/download'], middleware.test)
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