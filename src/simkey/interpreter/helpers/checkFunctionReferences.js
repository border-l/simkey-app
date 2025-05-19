const ThrowError = require("../errors/ThrowError")

// Checks that the function references in #checkLater are valid
module.exports = (context) => {
    // Check each function
    for (const func of context.checkLater) {
        // Function doesnt exist anywhere
        if (!context.funcs[func] && !context.model.IMPORTS[func]) {
            ThrowError(3020, { AT: func })
        }
    }
    
    // Clear array, checked all
    context.update("checkLater", [])
}