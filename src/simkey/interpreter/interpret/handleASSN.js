const ThrowError = require("../errors/ThrowError")
const evaluateExpr = require('../evaluator/evaluateExpr')
const resultHandler = require('./resultHandler')
const getVariable = require('../types/getVariable')

// Handle ASSN instructions (assignments)
function handleASSN(context, instruction, input, constant = false) {
    let [_, varName, assnFunction, exprValue] = instruction

    // Get whatever variable is
    let variable = context.variables[varName]

    // In case of index, handle that
    let index = null

    // Check if there are keys/index, and get variable (num, str, or table)
    if (varName.indexOf(":") > -1) {
        variable = getVariable(context, varName, ["NUM", "STR", "TABLE"])

        const rootVarName = varName.slice(0, varName.indexOf(":"))
        const rootVariable = context.variables[rootVarName]
        index = varName.slice(varName.indexOf(":") + 1)

        if (typeof rootVariable === "string") ThrowError(2730, { AT: varName })
        if (Array.isArray(rootVariable)) index = evaluateExpr(context, index)
        else index = index.split(":")

        varName = rootVarName
    }

    // Make sure not a constant
    if (context.constants.includes(varName)) {
        ThrowError(2700, { AT: varName })
    }

    // Cannot make constant if already exists
    if (variable !== undefined && constant) {
        ThrowError(2725, { AT: varName })
    }

    let result = resultHandler(context, exprValue, input)
    result = assnFunction(result, variable, varName)

    // Table with key(s)
    if (Array.isArray(index)) {
        let root = context.variables[varName]
        for (const key of index.slice(0, -1)) root = root[key]
        root[index.at(-1)] = result
    }

    // Vector with index
    else if (index !== null) {
        context.variables[varName][index] = result
    }

    // // Vector without index (could or could not already be vector)
    // else if (typeof result === "number") {
        // if (Array.isArray(variable)) context.variables[varName][0] = result
        // else context.variables[varName] = [result]
    //     context.variables[varName] = result
    // }

    // Misc, will assign directly
    else context.variables[varName] = result


    // Move into constants
    if (constant) {
        context.constants.push(varName)
    }
}

module.exports = handleASSN