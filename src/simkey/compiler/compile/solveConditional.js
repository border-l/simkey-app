const findNextOr = require("../helpers/findNextOr")
const ThrowError = require("../errors/ThrowError")

// Evaluates conditional expression
function solveConditional(context, INFO, condition) {
    for (let i = 0; i < condition.length; i++) {
        const current = condition[i]
        let value

        // Boolean function
        if (typeof current === "function") {
            value = current(INFO)
            if (value !== true && value !== false) {
                ThrowError(4015, { AT: current, VALUE: value })
            }
        }
        
        // Nested conditions
        else if (Array.isArray(current)) {
            value = solveConditional(context, INFO, current)
        }

        // Negation
        else if (current.startsWith("!")) {
            // Function vs non-function
            value = !context.settings[current.substring(1)]
        }

        // As-is
        else {
            value = context.settings[current]
        }

        // Does not exist
        if (value === undefined) {
            ThrowError(3005, { AT: current })
        }

        // False, move to next or
        if (!value) {
            i = findNextOr(condition, i)
        }

        // End of expression or automatically true as or
        else if (i === condition.length - 1 || condition[i + 1] === "|") {
            return true
        }
        
        // Move on, check other values
        else {
            i++
        }
    }

    // Must be false to reach here
    return false
}

module.exports = solveConditional