const controlless = require('../app/controllers/api.my.js')
// const middleware = require('../app/middleware/index.js')

async function routes(fastify, options) {
    // 我的资产
    fastify.get('/assets', controlless.assets.get_opts, controlless.assets.get)
    fastify.get('/assets/list', controlless.assets_list.get_opts, controlless.assets_list.get)
    // 登录
    fastify.get('/login-log', controlless.login_log.get_opts, controlless.login_log.get)
    // 上传照片
    fastify.post('/upload-photo', controlless.upload_photo.post_opts, controlless.upload_photo.post)
    // 身份信息
    fastify.get('/authentication', controlless.authentication.get_opts, controlless.authentication.get)
    // 提交身份信息
    fastify.post('/authentication', controlless.authentication.post_opts, controlless.authentication.post)
    // 提现页所需信息
    fastify.get('/withdraw', controlless.withdraw.get_opts, controlless.withdraw.get)
    // 申请提现
    fastify.post('/withdraw', controlless.withdraw.post_opts, controlless.withdraw.post)



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