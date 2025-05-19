// Set default hold to num ms
function hold(INFO, num) {
    // Cannot have negative hold
    if (num < 0) {
        throw new Error("Hold value is less than 0.")
    }

    // Set hold in def to rounded num
    INFO.DEF[0] = Math.round(num)
}

module.exports = { FUNCTION: hold, TAKES: { PARAMS: "[NUM]", BLOCK: false } }