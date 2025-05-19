const parseSection = require("./parseSection")
const ThrowError = require("../errors/ThrowError")
const path = require("path")

// Handles export section
function parseExports(context) {
    // Current label
    let current = path.parse(context.fileName).name
    context.model.EXPORTS[current] = []

    parseSection(context, (tokens, token, i, section, next) => {
        // Changing labels
        if (token.at(-1) === ":") {
            current = token.slice(0, -1)
            if (!context.model.EXPORTS[current]) context.model.EXPORTS[current] = []
            return i
        }
        // Should be function otherwise
        if (token[0] !== "@")  ThrowError(1140, { AT: token })

        // Put function under label
        context.model.EXPORTS[current].push(token)
        return i
    }, (section) => section === "EXPORTS")
}

module.exports = parseExports