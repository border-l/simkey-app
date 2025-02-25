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
        const token = searchArray[i]

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
    array = string.substring(trimmed ? 1 : 2).trim().split(",")
    array.forEach((val) => {
        val = val.trim() 
    })

    // Array and final index
    return [array, i]
}