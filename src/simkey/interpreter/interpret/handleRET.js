const resultHandler = require('./resultHandler')

// Handle RET instructions (return statements)
function handleRET(context, instruction, input) {
    let [_, exprValue] = instruction
    return resultHandler(context, exprValue, input)
}

module.exports = handleRET