const getArray = require("../types/getArray")
const getString = require('../types/getString')
const getVariable = require('../types/getVariable')
const evaluateExpr = require("../evaluator/evaluateExpr")
const checkVariableName = require('../helpers/checkVariableName')

// Utility for reading args from a LOOSE string
function looseReader(context, looseString, types) {
    looseString = "[" + looseString + "]"
    const [array, _] = getArray(context, 0, false, looseString.split(" "))
    const finalArgs = []

    for (let i = 0; i < array.length; i++) {
        const arg = array[i]

        if (checkVariableName(arg.trim(), true)) {
            try {
                finalArgs.push(getVariable(context, arg.trim(), types))
                continue
            } catch (e) {}
        }

        if (types.indexOf("STR") > -1) {
            try {
                const [string, newIndex] = getString(context, i, array, ",")
                finalArgs.push(string)
                i = newIndex
                continue
            } catch (e) {}
        }

        if (types.indexOf("NUM") > -1) {
            if (!isNaN(Number(arg.trim()) && typeof arg === "number")) {
                finalArgs.push(Number(arg.trim()))
                continue
            }

            const value = evaluateExpr(context, arg, true, true)

            if (!isNaN(value) || (typeof value === "boolean" && types.indexOf("BOOL") > -1)) {
                finalArgs.push(value)
                continue
            }
        }

        if (types.indexOf("BOOL") > -1) {
            if (arg.trim() === "true" || arg.trim() === "false") {
                finalArgs.push(arg.trim() === "true")
                continue
            }

            const value = evaluateExpr(context, arg, true, true)

            if ((!isNaN(value) && types.indexOf("NUM") > -1) || typeof value === "boolean") {
                finalArgs.push(value)
                continue
            }
        }

        throw new Error("Argument did not match any of the types. AT: " + arg + ", EXPECTED: " + types)
    }

    return finalArgs
}

module.exports = looseReader