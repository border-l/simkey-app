const parser = new (require("expr-eval").Parser)()
const getVariable = require("../types/getVariable")
const ThrowError = require("../errors/ThrowError")

const loadIntoParser = require("./loadIntoParser")
loadIntoParser(parser)

function evaluateExpr(context, expression, bool = false, asIs = false) {
    const stored = new Map()

    // Deal with escaped brackets
        // These are done due to the parser's
        // bad design.
        // expr-eval deems this an "invalid escape
        // sequence", so when evaluating, get
        // rid of it before.
    expression = expression.replaceAll(/(?:"\\]\s|\s\\]\s)/g, "]")

    // Replace variables with random variable name from getVariable
    const expr = expression.replaceAll(/\$\w+(?::[:\w]+)?/g, (varName) => {
        const variable = getVariable(context, varName)

        if (!stored.get(variable)) {
            stored.set("a".repeat(stored.size + 1), variable)
            return "a".repeat(stored.size)
        }
        else return stored.get(variable)
    })

    const variables = {}
    stored.forEach((val, key) => variables[key] = val)

    if (stored.get(expr.trim()) !== undefined) {
        return stored.get(expr.trim())
    }

    // expr-eval evaluater
    const evaluate = parser.evaluate(expr, variables)

    if (isNaN(evaluate) && typeof evaluate !== "boolean") {
        ThrowError(1115, { AT: expression })
    }

    // Return it as is
    if (asIs) return evaluate

    // Return according to bool arg
    return !bool ? Number(evaluate) : !(!evaluate)
}

module.exports = evaluateExpr