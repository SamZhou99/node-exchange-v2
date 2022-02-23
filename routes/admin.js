async function routes(fastify, options) {
    fastify.get('/admin', async (request, reply) => {
        return { hello: 'admin' }
    })
}

module.exports = routes