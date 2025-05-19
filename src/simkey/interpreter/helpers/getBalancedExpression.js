const ThrowError = require("../errors/ThrowError")

// Takes a string starting with "(" and finds the first balanced expression
function getBalancedExpression(string, error = false) {
    let depth = 1
    
    for (let i = 1; i < string.length; i++) {
        if (string[i] === "(") depth++
        else if (string[i] === ")") depth--
        else if (string[i] === " ") {
            if (error) ThrowError(1115, { AT: "[SPACE WITHIN INDEX] " + string })
            return ""
        }

        if (depth === 0) return string.slice(0, i + 1)
    }

    if (error) ThrowError(1115, { AT: string })
    return ""
}

module.exports = getBalancedExpression