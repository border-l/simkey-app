const getVariable = require("../types/getVariable")
const evaluateExpr = require("../evaluator/evaluateExpr")
const checkVariableName = require("../helpers/checkVariableName")
const ThrowError = require("../errors/ThrowError")
const STRING_MARKER = require("../helpers/STRING_MARKER")
const getString = require('../types/getString')

// Sets all the parameter variables for simkey function
function setFuncCallParams(context, func, args) {
    // Get parameters for function
    const funcParams = context.funcs[func]

    // List for setting to be done by instructionRunner function (will be in instruction list)
    const setList = []

    // Set parameters for each argument
    for (let i = 0; i < args.length; i++) {
        const arg = args[i].trim()

        // Variable to set
        const varName = funcParams[1][i]

        // Literal boolean
        if (arg === "true" || arg === "false") {
            setList.push(["SET", varName, "ALL", () => arg === "true"])
            continue
        }

        // Literal number
        if (!isNaN(Number(arg)) && arg.trim() != "") {
            setList.push(["SET", varName, "ALL", () => Number(arg)])
            continue
        }

        // Simple variable to handle
        if (checkVariableName(arg, true)) {
            if (arg.indexOf(":") > -1) setList.push(["SET", varName, "ALL", (context) => getVariable(context, arg, ["NUM", "TABLE", "STR"])])
            else setList.push(["SET", varName, "ALL", (context) => getVariable(context, arg, ["NUM", "VECTOR", "BOOL", "STR", "TABLE"])])
            continue
        }

        try {
            const [string, finalIndex] = getString(context, i, args, ",")
            setList.push(["SET", varName, "ALL", () => string])
            i = finalIndex
            continue
        }
        catch (error) { }

        // Assign to expression as-is
        setList.push(["SET", varName, "ALL", (context) => evaluateExpr(context, arg, true, true)])
    }

    // Too little or too many arguments, throw error
    if (setList.length > funcParams[1].length) {
        ThrowError(2105, { AT: func })
    }
    if (setList.length < funcParams[1].length) {
        ThrowError(2100, { AT: func })
    }

    return setList
}

module.exports = setFuncCallParams