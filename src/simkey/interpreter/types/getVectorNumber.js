const ThrowError = require("../errors/ThrowError")
const evaluateExpr = require("../evaluator/evaluateExpr")
const getBalancedExpression = require("../helpers/getBalancedExpression")

// Gets number value from vector
function getVectorNumber(context, vector, noError = false, errorIndex = false) {
    // Get colon's index and vector, finalNumber will be figured
    const colonIndex = vector.indexOf(":")
    const vectorArray = context.variables[vector.substring(0, colonIndex > -1 ? colonIndex : vector.length)]

    if (!Array.isArray(vectorArray)) {
        // Vector does not exist, error
        if (!noError) ThrowError(3010, { AT: vector })

        // Vector does not exist, no error
        return false
    }

    // Terrible but it's a placeholder
    let ind = vector.substring(colonIndex + 1)

    // Expression for index
    if (ind[0] === "(") {
        const newInd = getBalancedExpression(ind)

        if (newInd.length !== ind.length) {
            if (!noError) ThrowError(1115, { AT: ind })
            return false
        }

        ind = evaluateExpr(context, ind)
    }
    // Get vector index
    else {
        ind = colonIndex > -1 ? Number(vector.substring(colonIndex + 1)) : undefined
    }

    if (ind === undefined) {
        // if (!errorIndex) ThrowError(3200, { AT: vector + " (no index given)" })
        return false
    }

    // Check it is not out of range
    if (ind >= vectorArray.length || ind < -1 * vectorArray.length) {
        if (!errorIndex) ThrowError(3200, { AT: vector })
        return false
    }

    // Wrap negative indices around to positive
    if (ind < 0) {
        ind = vectorArray.length + ind
    }

    return vectorArray[ind]
}

module.exports = getVectorNumber