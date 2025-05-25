// Returns the current cursor position
function getCursor(INFO) {
    const res = [0, 0]
    INFO.ROBOT.getCursor(res)

    return res
}

module.exports = { FUNCTION: getCursor, TAKES: { PARAMS: "[]" }}