const checkVariableName = require("../helpers/checkVariableName")
const ThrowError = require("../errors/ThrowError")

// Get func params and define them as variables
function parseFuncParams(context, params) {
    // Return params
    parsedParams = []
    
    // Go through each parameter
    for (const param of params) {
        // Get type if it's there
        const split = param.split("->")

        // Type is vector by default
        if (!split[1]) {
            split[1] = "VECTOR"
        }

        // Check valid type
        if (split[1] !== "VECTOR" && split[1] !== "BOOL") {
            ThrowError(2210, { AT: split[1]})
        }

        // Check valid variable name for param var
        if (!checkVariableName(split[0])) {
            ThrowError(1100, { AT: split[0] })
        }

        // Handle boolean param
        if (split[1] === "BOOL") {
            // Param is already a vector
            if (Object.keys(context.model.VECTORS).includes(split[0])) {
                ThrowError(2200, { AT: split[0] })
            }

            // Already a mode, cannot be changed
            if (context.model.MODES.includes(split[0])) {
                ThrowError(2205, { AT: split[0] })
            }

            // Doesnt exist, set it to false by default
            if (!context.model.SWITCHES.includes(split[0])) {
                context.model.SWITCHES.push(split[0])
                context.settings[split[0]] = false
            }
        }

        // Handle vector param
        else {
            // Vector is already declared as a boolean variable
            if ([...context.model.SWITCHES, ...context.model.MODES].includes(split[0], false)) {
                ThrowError(2200, { AT: split[0] })
            }

            // Doesnt exist, set it to [0,0] by default
            if (!Object.keys(context.model.VECTORS).includes(split[0]))
                context.model.VECTORS[split[0]] = [0,0]
        }

        // Add param name and type to parsedParams
        parsedParams.push([split[0], split[1]])
    }

    // Done params
    return parsedParams
}

module.exports = parseFuncParams