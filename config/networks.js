const os = require('os')

let _t = {
    LocalNewworkIP() {
        let nets = os.networkInterfaces()
        for (let key in nets) {
            let netsArr = nets[key]
            for (let i = 0; i < netsArr.length; i++) {
                let item = netsArr[i]
                let address = item.address
                if (address.indexOf('.') != -1) {
                    let addressLast = address.split('.')
                    if (addressLast[addressLast.length - 1] != 1) {
                        return address
                    }
                }
            }
        }
        return null
    }
}

module.exports = _t