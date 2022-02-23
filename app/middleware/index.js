module.exports = {
    async test(request, reply, next) {
        reply.data = 'test'
        console.log('测试中间件')
        next()
    },
}