const ThrowError = require("../errors/ThrowError")

// Parse imported functions for conditionals
function parseBooleanFunctionCall(context, call) {
    // Getting args and name initially
    const [preName, preArgs, ...extra] = call.split("[")

    // Invalid syntax for arg
    if (extra.length > 0) {
        ThrowError(1135, { AT: call })
    }

    // Argument doesnt exist
    if (preArgs === undefined) {
        ThrowError(1135, { AT: call })
    }

    // Get name regardless of negation
    const name = preName.startsWith("!") ? preName.slice(1) : preName

    // Check function starts with @ (shouldn't happen?)
    // if (!name.startsWith("@")) {
    //     throw new Error("Function being referenced in condition does not start with `@`: " + name)
    // }

    // Check if the imported function exists
    if (!context.model.IMPORTS[name]) {
        ThrowError(3020, { AT: name })
    }

    // Get proper args, ignore ]
    const args = preArgs.slice(0,-1)

    // Means negation was there
    if (name !== preName) {
        return (INFO) => !context.model.IMPORTS[name.slice(1)](INFO, args)
    }

    // Return function
    return (INFO) => context.model.IMPORTS[name.slice(1)](INFO, args)
}

module.exports = parseBooleanFunctionCall