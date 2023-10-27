const controlless = require('../app/controllers/index.js')
const controlless_admin = require('../app/controllers/api.admin.js')
const middleware = require('../app/middleware/index.js')
const system_crpto = require('../lib/system.crypto.js')
const ErrMsg = require('../lib/error.msg.js')

async function routes(fastify, options) {
    // @todo remove
    fastify.get('/init.db.web', controlless.api.init.init_db_web)
    fastify.get('/init.db.admin', controlless.api.init.init_db_admin)
    fastify.get('/test/ip', controlless.api.test.ip)
    // fastify.post('/test/save.file', controlless.api.test.save_file)


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
    // K线图模板
    fastify.get('/kline-template/', controlless.api.kline_template.get_opts, controlless.api.kline_template.get)
    fastify.post('/kline-template/', controlless.api.kline_template.post_opts, controlless.api.kline_template.post)
    fastify.delete('/kline-template/', controlless.api.kline_template.delete_opts, controlless.api.kline_template.delete)

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

    // 秒合约
    fastify.get('/contract-sec', controlless.api.contract_sec.opts, controlless.api.contract_sec.list)
    fastify.get('/contract-sec/history', controlless.api.contract_sec.opts, controlless.api.contract_sec.list_history)
    fastify.post('/contract-sec/trade', controlless.api.contract_sec.post_opts, controlless.api.contract_sec.post)
    fastify.post('/contract-sec/check', controlless.api.contract_sec.check_opts, controlless.api.contract_sec.check_post)
    fastify.get('/contract-sec/service-charge', controlless.api.contract_sec.charge_opts, controlless.api.contract_sec.charge_get)
    fastify.put('/contract-sec/service-charge', controlless.api.contract_sec.charge_put_opts, controlless.api.contract_sec.charge_put)

    // pv
    fastify.get('/pv', controlless.api.pv.opts, controlless.api.pv.get)
    // banner
    fastify.get('/banner', controlless_admin.banner.get_opts, controlless_admin.banner.get)

    // 中间件
    // fastify.use(['/json', '/download'], middleware.test)

    // const EXCLUDE_ARR = ['/test/ip', '/api/config.json', '/api/login', '/api/register', '/api/banner', '/api/pv', '/api/currency-contract/service-charge', '/api/kline', '/api/contract-sec/service-charge', '/api/currency-platform', '/api/forgot-password', '/api/currency-contract/history'] // 排除检查
    // fastify.addHook('preHandler', (request, reply, done) => {
    //     let url = request.url

    //     // 排除
    //     for (let i = 0; i < EXCLUDE_ARR.length; i++) {
    //         let item = EXCLUDE_ARR[i]
    //         if (url.indexOf(item) != -1) {
    //             done()
    //             return
    //         }
    //     }

    //     // 解密 token
    //     let token = request.query.token || request.body.token || request.headers.token

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
    //         // token是否有超时
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