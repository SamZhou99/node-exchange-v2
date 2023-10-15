// 人人返利机制
let rr = [
    { id: 1, name: 'AA', money: 0, parent_id: 0 },
    { id: 2, name: 'BB', money: 0, parent_id: 1 },
    { id: 3, name: 'CC', money: 0, parent_id: 2 },
    { id: 4, name: 'DD', money: 0, parent_id: 3 },
    { id: 5, name: 'EE', money: 0, parent_id: 3 },
    { id: 6, name: 'FF', money: 0, parent_id: 3 },
]




function round(n) {
    let b = 100
    return Math.round(n * b) / b
}
function findId(id) {
    for (let i = 0; i < rr.length; i++) {
        const item = rr[i];
        if (item.id == id) return item
    }
}
function CZ(id, money) {
    let user = findId(id)
    user.money = round(user.money + money)
    for (let i = 0; i < 6; i++) {
        let user_parnet_id = user.parent_id
        if (user_parnet_id == 0) return
        // 
        let up = findId(user_parnet_id)
        let upm = money * (1 / 4)
        // 减去本金，给上级
        user.money = round(user.money - upm)
        up.money = round(up.money + upm)
        // 上级返上上级
        user = up
        money = upm
    }
    return true
}


CZ(4, 100)
CZ(5, 100)
CZ(6, 100)
CZ(6, 100)
CZ(6, 100)
CZ(6, 100)
console.log(rr)

sum = 0
for (let i = 0; i < rr.length; i++) {
    sum += rr[i].money
}
console.log(sum)