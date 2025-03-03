const ThrowError = require("../errors/ThrowError")
const checkSection = require("../helpers/checkSection")
const backCheck = require("../helpers/backCheck")

// Get string from array of tokens and index
module.exports = (context, index, searchArray = context.tokens, mustStart = false) => {
    // return string
    let string = ""

    // Start index, flag for end
    let i = index
    let hasEnd = false

    // Check whether other array was passed in than tokens
    const isSearchArray = context.tokens !== searchArray

    // Loop from index to length
    for (; i < searchArray.length; i++) {
        let token = searchArray[i]

        // Look past first " if it is there (DONT KNOW WHY IT WAS MADE LIKE THIS, CHANGING IT CAUSED ERRORS)
        if (i === index && token.charAt(0) === "\"") {
            token = token.substring(1)
        }
        else if (i === index && token.trim().charAt(0) === "\"") {
            token = token.substring(token.indexOf("\"") + 1)
        }
        else if (i === index && mustStart) {
            ThrowError(1001, { AT: token })
        }

        // If section token then no end to string (an argument for searchArray that isnt #tokens means no section tokens)
        if (!isSearchArray && checkSection(context, token)) {
            ThrowError(1000, { AT: context.tokens[index] + ", " + context.tokens[i + 2] })
        }

        // If there is an ending " that isnt escaped, finish loop
        if (token.endsWith('"') && !backCheck(token)) {
            string += (!isSearchArray ? " " : ",") + token.substring(0, token.length - 1)
            hasEnd = true
            break
        }

        // Account for difference in formatting
        string += (!isSearchArray ? " " : ",") + token
    }

    // No end to string, throw error
    if (!hasEnd) {
        ThrowError(1000, { AT: context.tokens[index] + ", " + string })
    }

    // Handle escape characters

    string = string.substring(1)
    let finalString = ""

    // Go through string forward
    for (let i = 0; i < string.length; i++) {
        // Escape char at i
        if (string.charAt(i) === "\\") {
            finalString += string.charAt(i + 1)
            i++
            continue
        }

        // Non-escaped, add it to string
        finalString += string.charAt(i)
    }

    // Final string and new index
    return [finalString, i]
}