const parseSection = require("./parseSection")
const ThrowError = require("../errors/ThrowError")
const getVariables = require("../types/getVariables")
const checkVariableName = require("../helpers/checkVariableName")

// Handles Mode & Switches sections
module.exports = (context) => {
    parseSection(context, (tokens, token, i, section, next) => {
        // Error if the variable name is invalid
        if (!checkVariableName(token)) {
            ThrowError(1100, { AT: token })
        }

        // Get list of variables and check for duplicates
        const others = getVariables(context)
        if (others.includes(token)) {
            ThrowError(1500, { AT: token })
        }
        
        // Add to model
        context.model[section].push(token)
    }, (section) => section === "MODES" || section === "SWITCHES")
}