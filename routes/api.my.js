const controlless = require('../app/controllers/api.my.js')
// const middleware = require('../app/middleware/index.js')

async function routes(fastify, options) {
    // 登录
    fastify.get('/login-log', controlless.login_log.opts, controlless.login_log.get)
    // 上传照片
    fastify.post('/upload-photo', controlless.upload_photo.opts, controlless.upload_photo.post)
    // 身份信息
    fastify.get('/authentication', controlless.authentication.get_opts, controlless.authentication.get)
    // 提交身份信息
    fastify.post('/authentication', controlless.authentication.opts, controlless.authentication.post)




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