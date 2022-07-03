const controlless = require('../app/controllers/index.js')
const middleware = require('../app/middleware/index.js')

async function routes(fastify, options) {
    // @todo remove
    fastify.get('/init.db.web', controlless.api.init.init_db_web)
    fastify.get('/init.db.admin', controlless.api.init.init_db_admin)
    fastify.get('/test/ip', controlless.api.test.ip)


    // 配置
    fastify.get('/config.json', controlless.api.config.get)
    // 发送邮箱验证码
    fastify.post('/send-email-verify', controlless.api.send_email_verify.opts, controlless.api.send_email_verify.post)
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
    fastify.post('/kline', controlless.api.kline.post_opts, controlless.api.kline.post)
    fastify.delete('/kline', controlless.api.kline.delete_opts, controlless.api.kline.delete)
    // 平台币  1：两个接口 首发项目使用。
    fastify.get('/currency-platform', controlless.api.currency_platform.opts, controlless.api.currency_platform.get)
    fastify.get('/:coin_name/currency-platform', controlless.api.currency_platform.opts, controlless.api.currency_platform.getItem)
    // 用户 参与平台币
    fastify.post('/participation-currency-platform', controlless.api.currency_platform.post_opts, controlless.api.currency_platform.post)
    // 合约币列表 合约兑换历史 买卖 止盈 止损 撤回 平仓
    fastify.get('/currency-contract', controlless.api.currency_contract.list)
    fastify.get('/currency-contract/history', controlless.api.currency_contract.opts, controlless.api.currency_contract.get)
    fastify.post('/currency-contract/trade', controlless.api.currency_contract.post_opts, controlless.api.currency_contract.post)
    fastify.put('/currency-contract/buystop-sellstop', controlless.api.currency_contract.put_opts, controlless.api.currency_contract.put_buy_sell_price)
    fastify.put('/currency-contract/withdraw', controlless.api.currency_contract.put_withdraw_opts, controlless.api.currency_contract.put_withdraw)
    fastify.put('/currency-contract/close-a-position', controlless.api.currency_contract.put_close_a_position_opts, controlless.api.currency_contract.put_close_a_position)
    fastify.get('/currency-contract/service-charge', controlless.api.currency_contract.charge_opts, controlless.api.currency_contract.charge_get)
    fastify.put('/currency-contract/service-charge', controlless.api.currency_contract.charge_put_opts, controlless.api.currency_contract.charge_put)

    // pv
    fastify.get('/pv', controlless.api.pv.opts, controlless.api.pv.get)

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