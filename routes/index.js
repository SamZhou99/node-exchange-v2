const controlless = require('../app/controllers/index.js')
const middleware = require('../app/middleware/index.js')

async function routes(fastify, options) {
    // fastify.use(['/json', '/download'], middleware.test)

    // fastify.get('/', controlless.main.index.page)
    // fastify.get('/json', controlless.main.json.page)
    // fastify.get('/upload', controlless.main.upload.page)
    // fastify.post('/upload', controlless.main.upload.post)
    // fastify.get('/download', controlless.main.download.page)
    // fastify.get('/test-ip', controlless.main.test_ip.page)


    fastify.get('/charts-line/:SymbolUSDT', controlless.main.charts.page)
}



module.exports = routes