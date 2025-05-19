const ThrowError = require("../errors/ThrowError")

// Set instruction to be handled directly by compile function
function handleSET(context, instruction) {
    // Separate parts of instruction
    const [_, varName, index, valueFunc] = instruction
    const value = valueFunc(context)

    // No longer care since it's guaranteed to be a local variable
    // // Check it isn't a constant
    // if (context.constants.includes(varName)) {
    //     ThrowError(5120, { AT: varName })
    // }

    // Setting entire vector array to be something else (or anything else now)
    if (index === "ALL") {
        if (typeof value === "number") {
            context.variables[varName] = [value]
            return
        }

        context.variables[varName] = value
        return
    }

    // Set a specific index instead

    // Non existent array
    if (!Array.isArray(context.variables[varName])) {
        ThrowError(5100, { AT: varName, TYPE: "VECTOR" })
    }
    // Non number index
    if (isNaN(index) || index === null) {
        ThrowError(5110, { VECTOR: varName, INDEX: index })
    }
    // Non number value
    if (isNaN(value) || value === null) {
        ThrowError(5115, { VECTOR: varName, VALUE: value })
    }

    // Set it, they're both valid
    context.variables[varName][index] = value
}

module.exports = handleSET