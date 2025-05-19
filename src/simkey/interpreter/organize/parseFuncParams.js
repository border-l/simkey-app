const checkVariableName = require("../helpers/checkVariableName")
const ThrowError = require("../errors/ThrowError")

// Get func params and define them as variables
function parseFuncParams(context, params) {
    // Return params
    parsedParams = []

    // Go through each parameter
    for (const param of params) {
        // Check valid variable name for param var
        if (!checkVariableName(param)) {
            ThrowError(1100, { AT: param })
        }

        // // Already a constant, cannot be changed
        // if (context.constants.includes(param)) {
        //     ThrowError(2205, { AT: param })
        // }

        // // Doesnt exist, set it to [0] by default
        // if (!Array.isArray(context.variables[param])) {
        //     context.variables[param] = [0]
        // }

        // Add param name and type to parsedParams
        parsedParams.push(param)
    }

    // Done params
    return parsedParams
}

module.exports = parseFuncParams