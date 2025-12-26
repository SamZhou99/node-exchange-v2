const config = require('./config/all.js')
const server = require('./lib/server.setup.js')
const RequestAuth = require('./lib/request.auth.js')
const ErrMsg = require('./lib/error.msg.js')
const SystemCrypto = require('./lib/system.crypto.js')

// fastify
const fastify = server.SerType('http')

// 静态文件目录
fastify.register(require('@fastify/static'), server.Static())

// 模板引擎
fastify.register(require('@fastify/view'), server.Template())

// cookie
fastify.register(require('@fastify/cookie'), { secret: "8hF0qH8vLLHzVgmATE9oVpfkiZI2X5no" })

// session
fastify.register(require('@fastify/session'), { secret: 'Z1rdwh8BsFDqXzK3OHFjUO4kKsrnci6j', cookie: { secure: false, } })

// form body
fastify.register(require('@fastify/formbody'))

// upload
fastify.register(require('fastify-file-upload'), { limits: { fileSize: 50 * 1024 * 1024 } })

// cors
fastify.register(require('@fastify/cors'), server.Cors)



// 装饰器
fastify.decorateRequest('data', null)
// 钩子
fastify.addHook('onRequest', (request, reply, next) => {
    request.data = {}
    // console.log(request.data)
    // console.log(request.url)
    // console.log(request.query)
    // console.log(request.cookies)
    // console.log(request.body)
    // console.log(request.params)
    next()
})


const EXCLUDE_ARR = config.safeurl.urls // 排除检查
fastify.addHook('preHandler', (request, reply, next) => {
    let url = request.url

    // 常规方法
    // reply.code(400)
    // next(new Error('Some error'))
    // console.log(request.url, request.originalUrl)

    // /api/my 请求安全过滤
    if (url.length > 8 && ['/api/my/'].includes(url.substr(0, 8))) {
        const rc = RequestAuth.Check(request, reply)
        if (rc > 0) {
            next(new Error(RequestAuth.ResultStr(rc)))
            return
        }
    }


    // 排除
    for (let i = 0; i < EXCLUDE_ARR.length; i++) {
        let item = EXCLUDE_ARR[i]
        if (url.indexOf(item) != -1) {
            next()
            return
        }
    }

    // 解密 token
    let token = request.query.token || request.body.token || request.headers.token

    if (token == undefined) {
        reply.code(400)
        next(new Error(ErrMsg.TOKEN_NOT_FOUND.code))
        return
    }

    // 解密是否错误
    let result
    try {
        result = SystemCrypto.decryption(token)
    } catch (err) {
        reply.code(400)
        next(new Error(ErrMsg.TOKEN_DECRYPTION_ERROR.code))
        return
    }

    // console.log("其他代码", request.url, result)
    result = JSON.parse(result)
    if (result.id == result.account) {
        // 检查ID和账号
    }
    if (result.status == 0) {
        // 状态不对
        reply.code(400)
        next(new Error(ErrMsg.TOKEN_STATUS_ERROR.code))
        return
    }
    if (result.ip) {
        // // 安全检查
        // reply.code(400)
        // done(new Error('OMG'))
        // return
    }
    if (new Date().getTime() - result.ts > 86400000) {
        // token是否有超时
        // console.log("\n是否有超时", result.ts, new Date().getTime(), new Date().getTime() - result.ts > 86400000)
        reply.code(400)
        next(new Error(ErrMsg.TOKEN_AUTH_TIMEOUT.code))
        return
    }

    next()
})
fastify.addHook('onResponse', (request, reply, next) => {
    next()
})

// 路由
fastify.register(require('./routes/api.admin.js'), { prefix: '/api/admin' })
fastify.register(require('./routes/api.agent.js'), { prefix: '/api/agent' })
fastify.register(require('./routes/api.my.js'), { prefix: '/api/my' })
fastify.register(require('./routes/api.js'), { prefix: '/api' })
fastify.register(require('./routes/index.js'))


// // 启动服务
// fastify.listen({ port: config.web.port }, (err, address) => {
//     if (err) {
//         fastify.log.error(err)
//         process.exit(1)
//     }
//     console.log(`http://${config.web.host}:${config.web.port}`)
//     console.log(address)
// })


// 启动服务
fastify.listen(
    { port: config.web.port, host: config.networks.LocalNewworkIP() },
    (err, address) => {
        if (err) {
            fastify.log.error(err)
            process.exit(1)
        }
        console.log(address)
    })