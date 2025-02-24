const checkVariableName = require("../../compiler/helpers/checkVariableName")
const evaluateExpr = require("../../compiler/helpers/evaluateExpr")

// Set a boolean to evaluated expression
function setBool(INFO, boolAndExpression) {
    // Split to get name and expression
    const [boolName, ...rest] = boolAndExpression.split(",")
    const expression = rest.join(",")

    // Must be a valid variable name
    if (!checkVariableName(boolName)) {
        throw new Error("Invalid variable name given to @setBool function: " + boolName)
    }

    // Cannot change modes
    if (INFO.MODES.includes(boolName)) {
        throw new Error("Attempting to set a mode with @setBool: " + boolName)
    }

    // Check it is not already a vector
    if (INFO.VECTORS[boolName]) {
        throw new Error("Attempted to set a bool under a name that is already a vector: " + vectorName)
    }

    // Literal boolean, evaluate instantly
    if (expression.trim() === "TRUE" || expression.trim() === "FALSE") {
        INFO.SETTINGS[boolName] = expression.trim() === "TRUE" ? true : false
        return
    }

    const context = {
        model: {
            VECTORS: INFO.VECTORS,
            settings: INFO.SETTINGS
        }
    }

    // Set bool to the evaluated expression
    INFO.SETTINGS[boolName] = evaluateExpr(context, expression, true)
}

module.exports = { FUNCTION: setBool, TAKES: { PARAMS: "[LOOSE]" } }