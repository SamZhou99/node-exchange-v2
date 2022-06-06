const titan = require('./titan.js')

async function init() {
    const r = Math.floor(100000 + Math.random() * 899999)
    await titan.sendMail("xpflash@gmail.com", "测试", `Code : <span style="color:#ffee00;background-color:#000000;font-size:2rem;padding:1rem;font-family:Verdana;">${r} </span>`)
}


init()