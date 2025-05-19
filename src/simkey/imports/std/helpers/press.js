const parseExpression = require('../../../interpreter/organize/parseExpression')

// Runs  a string as if it was a key expression
async function press(INFO, string) {
    const expressions = string.split(" ")
    const parsed = expressions.map(x => parseExpression(INFO.CONTEXT, x))
    await INFO.RUN(INFO, parsed)
}

module.exports = { FUNCTION: press, TAKES: { PARAMS: "[STR]" }}