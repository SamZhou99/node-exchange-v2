const utils99 = require('node-utils99')
const db_config = require('../config/db.js')
const db = new utils99.mysqlSync(db_config.mysql)

module.exports = {
    db
}