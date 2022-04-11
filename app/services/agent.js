const utils99 = require('node-utils99')
const { db } = require('../../lib/db.setup.js')

module.exports = {
    async agentByCode(invite_code) {
        const res = await db.Query("SELECT * FROM agent_list WHERE invite_code=?", [invite_code])
        return res.length > 0 ? res[0] : null
    },
    async oneById(agent_id) {
        const res = await db.Query("SELECT * FROM agent_list WHERE id=?", [agent_id])
        if (res.length > 0) {
            delete res[0].password
            return res[0]
        }
        return null
    }
}