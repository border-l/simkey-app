const parseSection = require("./parseSection")
const ThrowError = require("../errors/ThrowError")
const getVariables = require("../types/getVariables")
const checkVariableName = require("../helpers/checkVariableName")
const combineTillNext = require('../helpers/combineTillNext')

// Handles Vectors section
function parseVectors (context) {
    parseSection(context, (tokens, token, i, section, next) => {
        // Check the variable name is valid
        if (!checkVariableName(token)) {
            ThrowError(1100, { AT: token })
        }

        // Get list of variables and check for duplicates
        const others = getVariables(context)
        if (others.includes(token)) {
            ThrowError(1500, { AT: token })
        }

        // Get assignment
        const [assignment, index] = combineTillNext(context, "$", i, false, true)
        // Error if assignment operator is not present where it should be
        if (assignment.charAt(0) !== "=" || context.tokens[i + 1] !== "=") {
            ThrowError(1600, { AT: token, SECTION: "VECTORS" })
        }

        // Separate expression
        const [nums, input, ...rest] = assignment.replace("=", "").split("|")

        // Shouldnt exist
        if (rest.length > 0) {
            ThrowError(2400, { AT: token })
        }
        // Validate input if it is there
        if (input !== undefined && input !== "input") {
                ThrowError(2400, { AT: token })
        }

        // Get numbers in vector
        const numbers = nums.split(",").map((val) => val.length === 0 ? 0 : Number(val))
        // Error if there are no numbers
        if (numbers.length === 0) {
            ThrowError(2400, { AT: token })
        }

        // Error if invalid number present
        if (numbers.some((val) => isNaN(val))) {
            ThrowError(2405, { AT: token })
        }

        // Put in inputVectors if that was an option
        if (input !== undefined) {
            context.inputVectors[token] = numbers
        }

        // Assume other value is 0 if only one number
        if (numbers.length === 1) {
            context.model.VECTORS[token] = [numbers[0], 0]
            return index - 1
        }
        // Update & move past assignment
        context.model.VECTORS[token] = numbers
        return index - 1
    }, (section) => section === "VECTORS")
}

module.exports = parseVectors