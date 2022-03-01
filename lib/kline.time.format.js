const utils99 = require('node-utils99')

function getWeeks(m) {
    const Y = m.format('YYYY')
    for (let i = 1; i <= 56; i++) {
        let mm = utils99.moment(Y).add(i, 'weeks')
        // console.log(mm.format('YYYYMMDD'), m.unix(), mm.unix())
        if (m.unix() < mm.unix()) {
            return mm.subtract(1, 'weeks').format('YYYYMMDD')
        }
    }
    return null
}

function getHours(m, step) {
    const STEP = step
    const H = m.format('YYYYMMDD')
    for (let i = 0; i <= 24; i += STEP) {
        let mm = utils99.moment(H).add(i, 'hours')
        // console.log(mm.format('YYYYMMDD-HH'), m.unix(), mm.unix())
        if (m.unix() < mm.unix()) {
            return mm.subtract(STEP, 'hours').format('YYYYMMDD-HH')
        }
    }
    return null
}

function getMinute(m, step) {
    const H = m.format('YYYYMMDD HH')
    for (let i = 0; i <= 60; i += step) {
        let mm = utils99.moment(H).add(i, 'minutes')
        // console.log(mm.format('YYYYMMDD-HHmm'), m.unix(), mm.unix())
        if (m.unix() <= mm.unix()) {
            return mm.subtract(step, 'minutes').format('YYYYMMDD-HHmm')
        }
    }
    return null
}

function getDateTimeFormat(period) {
    const m = utils99.moment().utcOffset(480)
    let datetime = ''
    switch (period) {
        case '1min':
            datetime = m.format('YYYYMMDD-HHmm')
            break;
        case '5min':
            datetime = getMinute(m, 5)
            break;
        case '15min':
            datetime = getMinute(m, 15)
            break;
        case '30min':
            datetime = getMinute(m, 30)
            break;
        case '60min':
            datetime = getHours(m, 1)
            break;
        case '4hour':
            datetime = getHours(m, 4)
            break;
        case '1day':
            datetime = m.format('YYYYMMDD')
            break;
        case '1week':
            datetime = getWeeks(m)
            break;
        case '1mon':
            datetime = m.format('YYYYMM')
            break;
        case '1year':
            datetime = m.format('YYYY')
            break;
        default:
            datetime = m.format('YYYYMMDD')
            break;
    }
    return datetime
}


module.exports = {
    getDateTimeFormat
}