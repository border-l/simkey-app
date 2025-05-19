const combineTillNext = require("../helpers/combineTillNext")

// Function to clear all comments to avoid issues with parsing
function clearComments(context) {
    // Current tokens and array for commentless tokens
    const tokens = context.tokens
    const newTokens = []

    // Check each token
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]

        // Move to end of comment
        if (token === "#") {
            const [_, newIndex] = combineTillNext(context, "#", i, true)
            i = newIndex
            continue
        }

        // Non-comment, add it
        newTokens.push(token)
    }

    // Update tokens
    context.update("tokens", newTokens)
}

module.exports = clearComments