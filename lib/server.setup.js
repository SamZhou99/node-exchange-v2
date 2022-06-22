const fastify = require('fastify')
const path = require('path')
const fs = require('fs')


const logger = true


module.exports = {

    /**
     * 服务协议类型
     * @param {*} httpType http|https
     * @returns 
     */
    SerType(httpType) {
        if (httpType == 'http') {
            const options = { logger }
            return fastify(options)
        }
        // https配置
        const key_path = path.join(__dirname, '../', 'config', 'key.key')
        const cert_path = path.join(__dirname, '../', 'config', 'cert.cert')
        const options = {
            logger,
            http2: true,
            https: {
                allowHTTP1: true, // 向后支持 HTTP1
                key: fs.readFileSync(key_path),
                cert: fs.readFileSync(cert_path)
            }
        }
        return fastify(options)
    },

    /**
     * 静态目录设置
     * @returns 
     */
    Static() {
        return {
            root: path.join(__dirname, '../', 'public'),
        }
    },

    /**
     * 模板引擎目录和配置
     * @returns 
     */
    Template() {
        return {
            engine: {
                // ejs: require('ejs')
                'art-template': require('art-template')
            },
            templates: './views'
        }
    },

    /**
     * 跨域设置
     * @param {*} instance 
     * @returns 
     */
    Cors(instance) {
        return (req, callback) => {
            let corsOptions;
            const origin = req.headers.origin
            // do not include CORS headers for requests from localhost
            // if (/localhost/.test(origin)) {

            if (origin) {
                if (origin.indexOf('localhost') != -1
                    || origin.indexOf('127.0.0.1') != -1
                    || origin.indexOf('192.168.') != -1
                    || origin.indexOf('go9488.cn') != -1
                    || origin.indexOf('fer-coin.com') != -1
                    || origin.indexOf('fercion.com') != -1
                    || origin.indexOf('allcfd.com') != -1
                    || origin.indexOf('ttcoin.cc') != -1) {
                    corsOptions = { origin: true }
                } else {
                    corsOptions = { origin: false }
                }
            } else {
                corsOptions = { origin: false }
            }

            callback(null, corsOptions) // callback expects two parameters: error and options
        }
    }
}