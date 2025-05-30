// Loops the script the specified amount of times
function loopScript(INFO, num = -1) {
    INFO.CONTEXT.update("repeat", num)
}

module.exports = { FUNCTION: loopScript, TAKES: { PARAMS: "[NUM:OPTIONAL]" }}