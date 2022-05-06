const controlless = require('../app/controllers/api.my.js')
// const middleware = require('../app/middleware/index.js')

async function routes(fastify, options) {
    // 我的资产 // 更新钱包金额
    fastify.get('/assets', controlless.assets.get_opts, controlless.assets.get)
    fastify.get('/assets/list', controlless.assets.getList_opts, controlless.assets.getList)
    fastify.get('/assets/wallet/amount', controlless.assets.getWalletAmount_opts, controlless.assets.getWalletAmount)

    // 登录日誌
    fastify.get('/login-log', controlless.login_log.get_opts, controlless.login_log.get)
    // 上传照片
    fastify.post('/upload-photo', controlless.upload_photo.post_opts, controlless.upload_photo.post)
    // 身份信息
    fastify.get('/authentication', controlless.authentication.get_opts, controlless.authentication.get)
    // 提交身份信息
    fastify.post('/authentication', controlless.authentication.post_opts, controlless.authentication.post)
    // 提现页所需信息
    fastify.get('/withdraw', controlless.withdraw.get_opts, controlless.withdraw.get)
    fastify.get('/withdraw/history', controlless.withdraw.get_opts, controlless.withdraw.list)
    // 申请提现
    fastify.post('/withdraw/applyfor', controlless.withdraw.post_opts, controlless.withdraw.post)
    // 划转
    fastify.post('/transfer', controlless.transfer.post_opts, controlless.transfer.post)
    // 划转历史记录
    fastify.get('/transfer/history', controlless.transfer.get_opts, controlless.transfer.get)

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