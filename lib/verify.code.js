let codeArr = []
function randomCode() {
    const len = 6
    const s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%&*?'
    let code = ""
    for (let i = 0; i < len; i++) {
        code += s[Math.floor(Math.random() * s.length)]
    }
    return code
}
function randomInt(min, max) {
    return Math.floor(min + (Math.random() * (max - min)))
}
function check(code) {
    for (let i = 0; i < codeArr.length; i++) {
        let item = codeArr[i].code
        if (code == item) {
            return true
        }
    }
    return false
}
function createCode() {
    for (let i = 0; i < 255; i++) {
        let code = randomCode()
        if (check(code)) {
            continue
        }
        return code
    }
    return null
}
function createInt() {
    for (let i = 0; i < 255; i++) {
        let code = randomInt(1000, 9990)
        if (check(code)) {
            continue
        }
        return code
    }
    return null
}
function clearByTime() {
    const currTime = new Date().getTime()
    for (let i = codeArr.length - 1; i >= 0; i--) {
        let time = codeArr[i].time
        if (currTime - 1000 * 60 > time) {
            codeArr.splice(i, 1)
        }
    }
    return true
}


setInterval(() => {
    clearByTime()
    // console.log(codeArr)
}, 1000 * 30)


let _t = {
    create(ip) {
        // let code = createCode()
        let code = createInt()
        codeArr.push({ code, ip, time: new Date().getTime(), })
        return code
    },
    isExist(code) {
        return check(code)
    },
    randomInt(min, max) {
        return randomInt(min, max)
    }
}

module.exports = _t