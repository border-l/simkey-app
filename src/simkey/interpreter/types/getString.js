const ThrowError = require("../errors/ThrowError")
const checkSection = require("../helpers/checkSection")
const isEscaped = require("../helpers/isEscaped")

// Get string from array of tokens and index (first char has to be \" or spaces followed by it, last will end with \")
function getString(context, index, searchArray = context.tokens, join = " ") {
    let quoteIndex = 0
    for (let i = 0; i < searchArray[index].length; i++) {
        if (searchArray[index][i] === '"') {
            quoteIndex = i
            break
        }
        if (searchArray[index][i] !== " ") ThrowError(1001, { AT: searchArray[index] })
    }

    if (searchArray[index][quoteIndex] !== '"') {
        ThrowError(1001, { AT: searchArray[index] })
    }

    let string = ""
    let hasEnd = false
    const isTokens = context.tokens === searchArray

    for (var i = index; i < searchArray.length; i++) {
        let token = i === index ? searchArray[i].substring(quoteIndex + 1) : searchArray[i]

        // If section token then no end to string (an argument for searchArray that isnt #tokens means no section tokens)
        if (isTokens && checkSection(context, token)) {
            ThrowError(1000, { AT: context.tokens[index] + ", " + context.tokens[i + 2] })
        }

        // If there is an ending " that isnt escaped, finish loop
        if (token.endsWith('"') && checkEscapedOrInvalid(token)) {
            string += join + token.slice(0, -1)
            hasEnd = true
            break
        }

        string += join + token
    }

    if (string.length > 1 && string.substring(join.length) === searchArray[index] && checkEscapedOrInvalid(string.substring(1))) {
        string = string.slice(0, string.lastIndexOf('"'))
    }

    // No end to string, throw error
    else if (!hasEnd) {
        ThrowError(1000, { AT: context.tokens[index] + ", " + string })
    }

    // Handle escape characters

    string = string.substring(join.length)
    let finalString = ""

    for (let ind = 0; ind < string.length; ind++) {
        // Escape char at i
        if (string[ind] === "\\") {
            finalString += escapedCharacter(string[ind + 1])
            ind++
            continue
        }

        // Non-escaped, add it to string
        finalString += string[ind]
    }

    // Final string and new index
    return [finalString, i]
}

// Assumes quote is the last in string, otherwise infinite loop
function checkEscapedOrInvalid(string) {
    let newStr = string

    // When string runs out, every quote is escaped
    while (newStr.length > 0) {
        if (isEscaped(newStr, newStr.indexOf('"'))) newStr = newStr.slice(newStr.indexOf('"') + 1)
        else if (newStr.indexOf('"') === newStr.length - 1) return true
        else ThrowError(1000, { AT: string + " (unescaped quote inside of string)" })
    }

    return false
}

// Escapes the character, eg. n -> \n
function escapedCharacter(char) {
    switch (char) {
        case "n": return "\n"
        case "t": return "\t"
        case "r": return "\r"
        case "b": return "\b"
        default: return char
    }
}

module.exports = getString