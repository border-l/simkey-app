const evaluateExpr = require("../../compiler/helpers/evaluateExpr")

// Set an index (expression) of a vector to a value from an expression
function setIndex(INFO, vector, indexAndExpression) {
    let [index, expression] = indexAndExpression.split(",")

    const context = {
        model: {
            VECTORS: INFO.VECTORS,
            settings: INFO.SETTINGS
        }
    }

    index = evaluateExpr(context, index)

    // Set specific index to the value of evaluated expression
    vector[index] = evaluateExpr(context, expression)
}

module.exports = { FUNCTION: setIndex, TAKES: { PARAMS: "[VECTOR, LOOSE]" } }