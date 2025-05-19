const BaseErrors = require("./BaseErrors.json")

// Maps the errors to a code
function GetErrorToCode(FORMAT, TYPE_CODE) {
    // Step between categories, in the same category, and start code
    const stepNext = 50
    const stepSame = 1
    const startCode = 0

    // Holding mapped errors
    const ErrorToCode = {}
    
    // Category of error
    let type = ""

    // Code index variable
    let code = TYPE_CODE + startCode

    // Go through errors defined
    for (const Error in FORMAT) {
        // By default
        let ErrorType = Error

        // Get first part to categorize
        for (let i = 1; i < Error.length; i++) {
            if (Error[i].toUpperCase() === Error[i]) {
                ErrorType = Error.slice(0,i)
                break
            }
        }

        // Already exists in already defined ones
        if (BaseErrors[Error] !== undefined) {
            // Get code from established and add it
            code = BaseErrors[Error]
            ErrorToCode[Error] = code

            // Account for new category, continue
            if (type != ErrorType) type = ErrorType
            continue
        }

        // Handle different steps based on category
        if (type === "") type = ErrorType
        else if (type === ErrorType) code += stepSame
        else {
            type = ErrorType
            code -= code % stepNext
            code += stepNext
        }

        // Add to map
        ErrorToCode[Error] = code
    }

    // Give map
    return ErrorToCode
}

// Create the functions to throw errors
function CreateErrorFunctions(FORMAT, Type, ErrorToCode) {
    const ErrorFunctions = {}

    // Bind each error and put into map
    for (const Error in FORMAT) {
        ErrorFunctions[Error] = ThrowError.bind(null, Type, Error, ErrorToCode[Error], FORMAT[Error])
    }

    return ErrorFunctions
}

// Invert the object
function InvertErrorToCode(ErrorToCode) {
    return Object.fromEntries(Object.entries(ErrorToCode).map(([key, value])=>[value, key]))
}

// Error throwing function to bind for each error
function ThrowError(TYPE, NAME, CODE, ERR, args) {
    const MESSAGE = `${TYPE} (${NAME}: ${CODE}): ${ERR(args)}`

    throw new Error(MESSAGE)
}


module.exports = {
    GetErrorToCode,
    CreateErrorFunctions,
    InvertErrorToCode
}