const getVariable = require("../types/getVariable")
const getVectorNumber = require("../types/getVectorNumber")
const evaluateExpr = require("../helpers/evaluateExpr")
const checkVariableName = require("../helpers/checkVariableName")
const checkValidExpr = require("../helpers/checkValidExpr")
const ThrowError = require("../errors/ThrowError")

// Sets all the parameter variables for simkey function
function setFuncCallParams(context, func, args) {
    // Get parameters for function
    const funcParams = context.model.FUNCS[func]

    // Too little or too many arguments, throw error
    if (args.length > funcParams[1].length) {
        ThrowError(2105, { AT: func })
    }
    if (args.length < funcParams[1].length) {
        ThrowError(2100, { AT: func })
    }

    // List for setting to be done by compile function (will be in instruction list)
    const setList = []

    // Set parameters for each argument
    for (let i = 0; i < args.length; i++) {
        const arg = args[i].trim()

        // Variable to set and the expected type
        let expected = funcParams[1][i][1]
        const varName = funcParams[1][i][0]

        // Literal boolean
        if (arg === "TRUE" || arg === "FALSE") {
            // Not supposed to take boolean
            if (expected !== "BOOL")
                ThrowError(2110, { AT: func, ARG: arg, EXPECTED: "VECTOR" })

            // Wait why is this not being set?
            context.settings[varName] = arg === "TRUE" ? true : false

            continue
        }

        // Literal number
        if (!isNaN(Number(arg)) && arg.trim() != "") {
            // Not supposed to take a number
            if (expected !== "VECTOR")
                ThrowError(2110, { AT: func, ARG: arg, EXPECTED: "BOOL" })

            // Set index 0 to be the number
            setList.push(["SET", varName, 0, () => Number(arg)])

            continue
        }

        // Simple variable to handle
        if (checkVariableName(arg, true)) {
            // Does not exist under switches or modes and bool is expected
            if (!context.model.SWITCHES.includes(arg) && !context.model.MODES.includes(arg) && expected === "BOOL") {
                ThrowError(3015, { AT: arg })
            }

            // Doesn't exist under VECTORS and vector is expected (could have an index)
            if (!context.model.VECTORS[arg] && expected === "VECTOR") {
                const vectorNum = getVectorNumber(context, arg, true)

                // Means it has an index
                if (vectorNum === true) {
                    setList.push(["SET", varName, 0, getVariable.bind(null, context, arg, ["VECTOR"])])
                }

                else {
                    // Set variable since vector number does exist
                    setList.push(["SET", varName, "ALL", getVariable.bind(null, context, arg, ["VECTOR"])])
                    continue
                }
            }
            

            // Set them to be the argument
            if (expected === "BOOL") {
                setList.push(["SET", varName, "BOOL", getVariable.bind(null, context, arg, ["BOOL"])])
            }
            else {
                setList.push(["SET", varName, "ALL", getVariable.bind(null, context, arg, ["VECTOR"])])
            }

            continue
        }

        // Expression is the only option left
        if (!checkValidExpr(arg, expected === "BOOL")) {
            expected === "BOOL" ? ThrowError(2300, { AT: arg }) : ThrowError(2305, { AT: arg })
        }

        // Assigning expression to vector at 0
        if (expected !== "BOOL") {
            setList.push(["SET", varName, 0, evaluateExpr.bind(null, context, arg)])
            continue
        }
        
        // Assign to boolean
        setList.push(["SET", varName, "BOOL", evaluateExpr.bind(null, context, arg, true)])
    }

    return setList
}

module.exports = setFuncCallParams