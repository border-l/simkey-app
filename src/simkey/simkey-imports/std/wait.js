// Set default wait to num ms
function wait(INFO, num) {
    // Cannot have negative wait
    if (num < 0) {
        throw new Error("Wait value is less than 0.")
    }

    // Set wait in def to rounded num
    INFO.DEF[1] = Math.round(num)
}

module.exports = { FUNCTION: wait, TAKES: { PARAMS: "[NUM]" } }