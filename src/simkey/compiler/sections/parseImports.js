const tryImport = require("../importing/tryImport")
const parseSection = require("./parseSection")

// Handles import section
module.exports = (context) => {
    parseSection(context, (tokens, token, i, section, next) => {
        // Import current and move along
        return i + tryImport(context, tokens.slice(i, next))
    }, (section) => section === "IMPORTS")
}