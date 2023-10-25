const config = require('./config/all.js')
const server = require('./lib/server.setup.js')
const RequestAuth = require('./lib/request.auth.js')

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
fastify.addHook('preHandler', (request, reply, next) => {
    // 常规方法
    // reply.code(400)
    // next(new Error('Some error'))
    // console.log(request.url, request.originalUrl)

    // /api/my 请求安全过滤
    if (request.url.length > 8 && ['/api/my/'].includes(request.url.substr(0, 8))) {
        const rc = RequestAuth.Check(request, reply)
        if (rc > 0) {
            next(new Error(RequestAuth.ResultStr(rc)))
            return
        }
    }
    next()
})
fastify.addHook('onResponse', (request, reply, next) => {
    next()
})

// 路由
fastify.register(require('./routes/api.admin.js'), { prefix: '/api/admin' })
fastify.register(require('./routes/api.my.js'), { prefix: '/api/my' })
fastify.register(require('./routes/api.js'), { prefix: '/api' })
fastify.register(require('./routes/index.js'))


// 启动服务
fastify.listen({ port: config.web.port, host: '192.168.31.219' }, (err, address) => {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
    console.log(`http://localhost:${config.web.port}`)
    console.log(address)
})

console.log(`http://192.168.31.219:${config.web.port}`)