const checkVariableName = require("../../compiler/helpers/checkVariableName")
const evaluateExpr = require("../../compiler/helpers/evaluateExpr")

// Set index 0 of vector to evaluated expression
function set(INFO, vectorAndExpression) {
    // Split to get name and expression
    const [vectorName, ...rest] = vectorAndExpression.split(",")
    const expression = rest.join(",")

    // Must be a valid variable name
    if (!checkVariableName(vectorName)) {
        throw new Error("Invalid variable name given to @set function: " + vectorName)
    }

    // Check it is not already a boolean
    if (INFO.SETTINGS[vectorName]) {
        throw new Error("Attempted to set a vector under a name that is already a boolean: " + vectorName)
    }

    // Set it to [0,0] by default if doesnt exist
    if (!INFO.VECTORS[vectorName]) {
        INFO.VECTORS[vectorName] = [0,0]
    }

    const context = {
        model: {
            VECTORS: INFO.VECTORS,
            settings: INFO.SETTINGS
        }
    }

    // Set 0th index to be the evaluated expression
    INFO.VECTORS[vectorName][0] = evaluateExpr(context, expression)
}

module.exports = { FUNCTION: set, TAKES: { PARAMS: "[LOOSE]" } }