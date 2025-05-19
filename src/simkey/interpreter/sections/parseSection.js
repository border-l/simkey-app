const findNextSection = require("../helpers/findNextSection")
const checkSection = require("../helpers/checkSection")

// Loops through tokens to help parse sections
module.exports = (context, func, statement) => {
    const tokens = context.tokens
    let section = "MACRO"
    let nextSection = 0
    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i]

        // Check if this token is updating sections
        if (checkSection(context, token)) {
            section = token.substring(1, token.length - 1)
            continue
        }

        // Check for whether section should not be parsed
        if (!statement(section)) continue
        else if (nextSection == 0) nextSection = findNextSection(context, i)

        // Handle result of the function
        const result = func(tokens, token, i, section, nextSection)
        !isNaN(result) ? i = result : 0
    }
}