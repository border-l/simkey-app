const evaluateExpr = require("../../compiler/helpers/evaluateExpr")

// Evaluates boolean statements about vectors (for conditional expressions)
function e(INFO, expression) {
    const context = {
        model: {
            VECTORS: INFO.VECTORS,
            settings: INFO.SETTINGS
        }
    }
    return evaluateExpr(context, expression, true)
}

module.exports = { FUNCTION: e, TAKES: { PARAMS: "[CONDITION-EXPRESSION]" } }