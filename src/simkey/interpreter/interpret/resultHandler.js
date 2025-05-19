const evaluateExpr = require('../evaluator/evaluateExpr')
const STRING_MARKER = require("../helpers/STRING_MARKER")
const getVariable = require("../types/getVariable")

// Handles the results from ASSN and RET instructions
function resultHandler(context, exprValue, input) {
    let result = input

    // Array and single values handling
    if (Array.isArray(exprValue)) {
        result = []
        for (const expr of exprValue) {
            result.push(evaluateExpr(context, expr))
        }
    }

    else if (exprValue instanceof STRING_MARKER) {
        result = exprValue.get()
    }

    else if (result === undefined) {
        try {
            result = getVariable(context, exprValue, ["TABLE", "STR", "NUM", "BOOL", "VECTOR"])
        }
        catch (err) {
            result = evaluateExpr(context, exprValue, true, true)
        }
    }

    return result
}

module.exports = resultHandler