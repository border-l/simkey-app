const checkSection = require("./checkSection")

// Combine tokens till character into string (noSection for not considering section tokens)
module.exports = (context, char, index, noSection = false, noComments = false) => {
    let combination = ""

    for (let i = index + 1; i < context.tokens.length; i++) {
        const token = context.tokens[i]

        // Combine till character is found or section
        if (token.charAt(0) === char || (token === "#" && noComments) || (!noSection && checkSection(context, token))) {
            return [combination, i]
        }

        combination += token
    }

    // No character found, if section considered then return -1
    return ["", !noSection ? -1 : context.tokens.length]
}