const ThrowError = require("../errors/ThrowError")

// Set instruction to be handled directly by compile function
function handleSET(context, instruction) {
    // Separate parts of instruction
    const [_, varName, index, valueFunc] = instruction
    const value = valueFunc()

    // Handle boolean set
    if (index === "BOOL") {
        if (context.settings[varName] === undefined) {
            ThrowError(5100, { VAR: varName, TYPE: "BOOL" })
        }

        context.settings[varName] = !!value
        return
    }

    // Must be vector to get here
    if (!context.model.VECTORS[varName]) {
        ThrowError(5100, { VAR: varName, TYPE: "VECTOR" })
    }

    // Setting entire vector array to be something else
    if (index === "ALL") {
        if (!Array.isArray(value)) {
            ThrowError(5105, { VECTOR: varName, VALUE_TYPE: typeof value })
        }

        context.model.VECTORS[varName] = value
    }

    // Set a specific index
    else {
        // Non number index
        if (isNaN(index)) {
            ThrowError(5110, { VECTOR: varName, INDEX: index })
        }
        // Non number value
        if (isNaN(value)) {
            ThrowError(5115, { VECTOR: varName, VALUE: value })
        }
        
        // Set it, they're both valid
        context.model.VECTORS[varName][index] = value
    }
}

module.exports = handleSET