const ThrowError = require("../errors/ThrowError")
const evaluateExpr = require("../evaluator/evaluateExpr")
const getBalancedExpression = require("../helpers/getBalancedExpression")

// Gets value value from string (char or whole string)
function getStringValue(context, string, noError = false, errorIndex = false) {
    // Get colon's index and the string
    const colonIndex = string.indexOf(":")
    const stringValue = context.variables[string.substring(0, colonIndex > -1 ? colonIndex : string.length)]

    if (typeof stringValue !== "string") {
        // String does not exist, error
        if (!noError) ThrowError(3035, { AT: string })

        // String does not exist, no error
        return false
    }

    // Not specific char, return whole
    if (colonIndex === -1) {
        return stringValue
    }

    // Terrible but it's a placeholder
    let ind = string.substring(colonIndex + 1)

    // Expression for index
    if (ind[0] === "(") {
        const newInd = getBalancedExpression(ind)

        if (newInd.length !== ind.length) {
            if (!noError) ThrowError(1115, { AT: ind })
            return false
        }

        ind = evaluateExpr(context, ind)
    }
    // Get string index
    else {
        ind = colonIndex > -1 ? Number(string.substring(colonIndex + 1)) : defaultIndex
    }

    // Check it is not out of range
    if (ind >= stringValue.length || ind < -1 * stringValue.length) {
        if (!errorIndex) ThrowError(3200, { AT: string })
        return false
    }

    // Wrap negative indices around to positive
    if (ind < 0) {
        ind = stringValue.length + ind
    }

    return stringValue[ind]
}

module.exports = getStringValue