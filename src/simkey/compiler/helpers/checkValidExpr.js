const { Parser } = require("expr-eval")
const checkVariableName = require("./checkVariableName")
const getBalancedExpression = require('./getBalancedExpression')

function checkValidExpr(expression, boolean = false) {
    // Expression itself is a variable (supposedly), return false for something else to handle it
    if (checkVariableName(expression, true)) {
        return false
    }

    // This is sloppy, but it's a relatively unlikely issue
    if (checkVariableName("$" + expression, true)) {
        return false
    }

    // Look through matches with expr indices
    let match
    while ((match = /\$(\w+):\(/g.exec(expression)) !== null) {
        const varName = match[1]

        const indexExpr = getBalancedExpression(expression.slice(expression.indexOf(match[0]) + match[0].length - 1))

        expression = expression.replace(`${varName}:${indexExpr}`, varName)
    }

    // Get other variables in expression
    const variablePattern = /\$(\w+)(:(-)?(\d+))?/g
    const matchVariables = [...new Set(expression.match(variablePattern) || [])]

    // Check if each variable is named validly
    for (let i = 0; i < matchVariables.length; i++) {
        const variable = matchVariables[i]

        // Check name, index allowed
        if (!checkVariableName(variable, true)) {
            return false
        }

        if (variable.includes(":")) expression = expression.replace(variable, variable.slice(0, variable.indexOf(":")))
    }

    // Try to parse the expression
    try {
        Parser.parse(expression)

        // Distinguish between logical and mathematical
        if (/\b(and|or|not)\b/.test(expression)) {
            return boolean ? true : false
        }
        else {
            return boolean ? false : true
        }
    }

    // Errored, so it's invalid
    catch (err) {
        return false
    }
}

module.exports = checkValidExpr