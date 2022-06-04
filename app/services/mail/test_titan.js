const titan = require('./titan.js')

async function init() {
    await titan.sendMail("xpflash@gmail.com", "测试下", "邮件内容" + Math.floor(Math.random() * 999999))
}


init()