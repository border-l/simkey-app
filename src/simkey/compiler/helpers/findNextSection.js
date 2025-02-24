const checkSection = require("./checkSection")

// Finds the next section
module.exports = (context, index) => {
    // Go through to find section
    for (let i = index + 1; i < context.tokens.length; i++) {
        if (checkSection(context, context.tokens[i])) {
            return i
        }
    }

    // End of script
    return context.tokens.length
}