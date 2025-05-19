const checkSection = require("../helpers/checkSection")
const parseInnards = require("./parseInnards")

// Organizes tokens into model w/ exception of some sections
module.exports = (context) => {
    const tokens = context.tokens
    let section = "MACRO"

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]

        // Check if this token is updating sections
        if (checkSection(context, token)) {
            // Update section
            section = token.substring(1, token.length - 1)
            continue
        }

        // Skipped as other functions handle them later on
        if (section !== "MACRO") {
            continue
        }

        // Handle macro section
        const [model, newIndex] = parseInnards(context, i - 1, 1)
        model.forEach(x => context.model.MACRO.push(x))
        i = newIndex - 1
    }
}