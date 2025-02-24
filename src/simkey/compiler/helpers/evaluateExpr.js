const parser = new (require("expr-eval").Parser)()
const getBalancedExpression = require('./getBalancedExpression')
const ThrowError = require("../errors/ThrowError")

function evaluateExpr(context, expression, bool = false) {

    const vars = bool ? { ...context.model.VECTORS, ...context.settings } : context.model.VECTORS
    let expr = expression
        // Replaces indexed variables (vectors)
        .replaceAll(/\$(\w+):(-?\d+)/g, (_, varName, index) => {
            const variable = vars[`$${varName}`]
            
            // Check if the vector exists
            if (!Array.isArray(variable)) {
                ThrowError(3010, { AT: varName })
            }

            // Index must be within positive and negative limits
            if (index > variable.length - 1 || index < variable.length * -1) {
                ThrowError(3200, { AT: varName + ":" + index })
            }

            // Modulus to get corresponding positive index regardless
            return variable[parseInt(((index % variable.length) + variable.length) % variable.length, 10)]
        })

    // Look through matches with expr indices
    let match
    while ((match = /\$(\w+):\(/g.exec(expr)) !== null) {
        const varName = match[1]
        const variable = vars[`$${varName}`]

        // Check if the vector exists
        if (!Array.isArray(variable)) {
            ThrowError(3010, { AT: varName })
        }

        const indexExpr = getBalancedExpression(expr.slice(expr.indexOf(match[0]) + match[0].length - 1), true)
        const index = evaluateExpr(context, indexExpr)

        // Index must be within positive and negative limits
        if (index > variable.length - 1 || index < variable.length * -1) {
            ThrowError(3200, { AT: varName + ":" + index })
        }

        // Modulus to get corresponding positive index regardless
        expr = expr.replace(`$${varName}:${indexExpr}`, variable[parseInt(((index % variable.length) + variable.length) % variable.length, 10)])
    }

    expr = expr
        // Replaces non-indexed variables (default to :0 for vectors)
        .replaceAll(/\$(\w+)/g, (_, varName) => {
            const variable = vars[`$${varName}`]

            // Variable doesn't exist at all
            if (variable === undefined) {
                ThrowError(3005, { AT: varName })
            }

            return Array.isArray(variable) ? variable[0] : variable
        })
        // Replace bools written like SIMKEY
        .replaceAll(/\b(FALSE)\b/g, "false")
        .replaceAll(/\b(TRUE)\b/g, "true")

    // expr-eval evaluater
    const evaluate = parser.evaluate(expr)    

    // Return according to bool arg
    return !bool ? Number(evaluate) : !(!evaluate)
}

module.exports = evaluateExpr