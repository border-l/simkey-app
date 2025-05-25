// Returns the screen size
function getScreenSize(INFO) {
    const res = [0, 0]
    INFO.ROBOT.getScreenSize(res)

    return res
}

module.exports = { FUNCTION: getScreenSize, TAKES: { PARAMS: "[]" }}