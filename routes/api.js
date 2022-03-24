const controlless = require('../app/controllers/index.js')
const middleware = require('../app/middleware/index.js')

async function routes(fastify, options) {
    // 配置
    fastify.get('/config.json', controlless.api.config.get)
    // 注册
    fastify.post('/register', controlless.api.register.opts, controlless.api.register.post)
    // 登录
    fastify.post('/login', controlless.api.login.opts, controlless.api.login.post)
    // 找回密码
    fastify.post('/forgot-password', controlless.api.forgot_password.opts, controlless.api.forgot_password.post)
    // 缓存数据
    fastify.get('/caches', controlless.api.caches.opts, controlless.api.caches.get)
    // K线数据
    fastify.get('/kline', controlless.api.kline.opts, controlless.api.kline.get)
    // 平台币  1：两个接口 首发项目使用。
    fastify.get('/currency-platform', controlless.api.currency_platform.opts, controlless.api.currency_platform.get)
    fastify.get('/:coin_name/currency-platform', controlless.api.currency_platform.opts, controlless.api.currency_platform.getItem)
    // 用户 参与平台币
    fastify.post('/participation-currency-platform', controlless.api.currency_platform.post_opts, controlless.api.currency_platform.post)
    // 合约 买卖
    fastify.get('/currency-contract/history', controlless.api.currency_contract.opts, controlless.api.currency_contract.get)
    fastify.post('/currency-contract/:action/trade', controlless.api.currency_contract.post_opts, controlless.api.currency_contract.post)





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