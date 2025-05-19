const looseReader = require("../../../interpreter/helpers/looseReader")

// Simply prints the input
function print(INFO, input) {
    const restArgs = looseReader(INFO.CONTEXT, input, ["NUM", "VECTOR", "STR", "BOOL", "TABLE"])
    console.log(...restArgs)
}

module.exports = { FUNCTION: print, TAKES: { PARAMS: "[LOOSE]", BLOCK: false } }