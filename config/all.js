const web = require('./web.js')
const db = require('./db.js')
const common = require('./common.js')
const blockchain = require('./blockchain.js')
const mail = require('./mail.js')
const safeurl = require('./safe.url.js')
const cors = require('./cors.js')
const networks = require('./networks.js')

module.exports = {
    web,
    db,
    common,
    blockchain,
    mail,
    safeurl,
    cors,
    networks,
}