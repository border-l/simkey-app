const ThrowError = require("../errors/ThrowError")
const checkSection = require("../helpers/checkSection")
const isEscaped = require("../helpers/isEscaped")

// Gets an array from an array of tokens
module.exports = (context, index, trimmed = true, searchArray = context.tokens) => {
    // Return array
    let array = []

    // Gather array string
    let string = ""

    // Start index
    let i = index

    // Loop from index to length
    for (; i < searchArray.length; i++) {
        let token = searchArray[i]

        // If there's a section token then the array has no end
        if (checkSection(context, token)) {
            ThrowError(1005, { AT: token })
        }

        if (token.endsWith("]") && !isEscaped(token, token.length - 1)) {
            // Deal with the fact tokens are trimmed (since space separates)
            string += (!trimmed ? " " : "") + token.substring(0, token.length - 1)
            break
        }

        // Deal with the fact tokens are trimmed (since space separates)
        string += (!trimmed ? " " : "") + token
    }

    // Something to do with strings
    string = string.substring(trimmed ? 1 : 2).trim()

    // Check balanced parentheses for each split
    let counter = 0
    let lastSplit = -1
    for (let x = 0; x < string.length; x++) {
        if (string[x] === "(") counter += 1
        if (string[x] === ")") counter -= 1
        if (string[x] === "," && counter === 0) {
            array.push(string.substring(lastSplit + 1, x))
            lastSplit = x
        }
    }
    array.push(string.substring(lastSplit + 1))

    // Array and final index
    return [array, i]
}