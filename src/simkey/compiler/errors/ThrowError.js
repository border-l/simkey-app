const { Errors: _, Types: __, Codes, ...Errors } = require("./ErrorOverview")

// Function to call error by code
function CallError(CODE, ARGS) {
    // Code doesn't exist
    if (!Codes[CODE]) {
        throw new Error("INTERNAL SIMKEY ERROR: Error Code referred to does not exist: " + CODE)
    }

    // Call it
    Errors[Codes[CODE]](ARGS)
}

module.exports = CallError