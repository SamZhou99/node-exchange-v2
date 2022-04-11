const controlless = require('../app/controllers/api.admin.js')
// const middleware = require('../app/middleware/index.js')

async function routes(fastify, options) {
    // 获取验证码
    fastify.get('/VerifyCode', controlless.verifyCode.get)
    // 查询-用户登录
    fastify.post('/login', controlless.login.post_opts, controlless.login.post)
    // 查询-用户列表
    fastify.get('/user-list', controlless.member.get_opts, controlless.member.get)
    // 查询-网站基础配置
    fastify.get('/config-list', controlless.config.get_opts, controlless.config.get)
    // 更新-网站基础配置
    fastify.put('/config-list', controlless.config.put_opts, controlless.config.put)
    // 增加-网站基础配置
    fastify.post('/config-list', controlless.config.post_opts, controlless.config.post)

    // 查询-用户列表 账号自动完成
    fastify.post('/user-list/account-auto-complete', controlless.member.auto_complete_opts, controlless.member.auto_complete_post)

    // 更新-用户属性
    fastify.put('/account/update', controlless.member.account_update_opts, controlless.member.account_update_put)

    // 更新-用户上下分
    fastify.put('/account/update-score', controlless.member.account_update_score_opts, controlless.member.account_update_score_put)

    // 更新-审核状态 用户身份认证
    fastify.put('/account/update-auth', controlless.member.account_update_auth_opts, controlless.member.account_update_auth_put)




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