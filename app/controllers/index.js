const config = require('../../config/all.js')
// const service = require('../services/index.js')
const api = require('./api.js')

const service_kline_history = require('../services/kline_history.js')

function templatePath() {
    return config.web.template_path
}

function view(request, reply, file, data) {
    const template = config.web.template_path
    let index = 0
    for (let i = 0; i < request.raw.rawHeaders.length; i++) {
        let item = request.raw.rawHeaders[i]
        if (item.toLowerCase() == 'user-agent') {
            index = i + 1
        }
    }
    const ua = request.raw.rawHeaders[index].toLowerCase();
    const isMobile = /mobile|android|iphone|ipad|phone/i.test(ua);
    const isWechat = /micromessenger/i.test(ua);
    const pc = isMobile || isWechat ? 'mobile' : 'pc'
    const view_file_path = `/${template}/${pc}/${file}`
    // console.log(ua, view_file_path)
    return reply.view(view_file_path, data)
}

let main = {
    charts: {
        async page(request, reply) {
            let symbol_usdt = request.params.SymbolUSDT
            let kline = []
            // for (let i = 0; i < 24; i++) {
            //     kline.push(10 + Math.floor(Math.random() * 90))
            // }

            let res = await service_kline_history.listBySymbol(symbol_usdt, '60min', 24)
            // console.log('结果结果结果结果结果结果结果结果结果结果', res)
            let len = res.length;
            for (let i = 0; i < len; i++) {
                kline.push(res[i].close)
            }
            return reply.view('default/charts/thumb.html', {
                data: {
                    symbol_usdt,
                    kline
                }
            })
        }
    },

    index: {
        async page(request, reply) {
            return view(request, reply, 'index.html', { data: '<i>hi</i>', html: '<i>HTML</i>' })
        }
    },

    json: {
        async page(request, reply) {
            return { hello: 'json' }
        }
    },

    upload: {
        async page(request, reply) {
            return reply.view('default/pc/upload.html', { data: '' })
        },
        async post(request, reply) {
            const files = request.raw.files
            let fileArr = []
            for (let key in files) {
                fileArr.push({
                    name: files[key].name,
                    mimetype: files[key].mimetype
                })
            }

            files.file.mv(`./public/uploads/${files.file.name}`, (err) => {
                if (err) {
                    return request.status(500).send(err);
                }
                return reply.send(fileArr)
            })
        }
    },

    download: {
        async page(request, reply) {
            //public目录中的文件
            return reply.download('hi.html')
        }
    },

    test_ip: {
        async page(request, reply) {
            return {
                data: request.headers,
                ip: request.ip,
                ips: request.ips,
            }
        }
    }
}
module.exports = { main, api }