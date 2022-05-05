const CryptoJS = require('crypto-js');
const config = require('../config/all.js');

const SECRET = config.web.SECRET

function randomCode() {
    const s = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"
    let code = ''
    for (let i = 0; i < 32; i++) {
        code += s[Math.floor(Math.random() * s.length)]
    }
    return code
}

let _t = {
    encryption(text) {
        return CryptoJS.AES.encrypt(text, SECRET).toString()
    },
    decryption(text) {
        return CryptoJS.AES.decrypt(text, SECRET).toString(CryptoJS.enc.Utf8)
    },

}


// const e = _t.encryption(JSON.stringify({ label: 'HELLO' }))
// const d = JSON.parse(_t.decryption(e))
// console.log(e, d)


module.exports = _t