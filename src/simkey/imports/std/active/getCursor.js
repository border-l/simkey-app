// Returns the current cursor position
function getCursor(INFO) {
    return INFO.ROBOT.getCursor()
}

module.exports = { FUNCTION: getCursor, TAKES: { PARAMS: "[]" }}