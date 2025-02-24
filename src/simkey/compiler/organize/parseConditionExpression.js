const findStringBracket = require("../helpers/findStringBracket")
const parseBooleanFunctionCall = require("./parseBooleanFunctionCall")
const ThrowError = require("../errors/ThrowError")

function parseConditionExpression(context, condition, negate = false) {
    let string = condition
    const parsedArray = []

    for (let i = 0; i < string.length; i++) {
        let char = string.charAt(i)
        
        if (char === "[" || string.charAt(i + 1) === "[" && char === "!") {
            // Deal with whether negation is there
            const startAdd = char !== "[" ? 1 : 0

            // Parse expression within bracket
            const closingBracket = findStringBracket(context, string.substring(i + startAdd))
            const parsedExpression = parseConditionExpression(context, string.substring(i + 1 + startAdd, i + startAdd + closingBracket), startAdd === 1 ? !negate : negate)

            // Only one thing, brackets unnecessary
            if (parsedExpression.length === 1) {
                parsedArray.push(parsedExpression[0])
            }

            // Several things
            else {
                parsedArray.push(parsedExpression)
            }

            i += closingBracket + startAdd
            continue
        }

        // Boolean imported function
        if (char === "@" || (char === "!" && string.charAt(i + 1) === "@")) {
            const searchString = string.substring(i)
            let toPushFunc = ""

            // No closing bracket for arguments
            if (searchString.indexOf("]") < 0) {
                ThrowError(1135, { AT: string })
            }

            toPushFunc = searchString.slice(0, searchString.indexOf("]") + 1)

            parsedArray.push(parseBooleanFunctionCall(context, toPushFunc))

            i += toPushFunc.length - 1
            continue
        }

        if (char === "$" || char === "!") {
            // Indices for checking next & and |
            const searchString = string.substring(i)
            const orIndex = searchString.indexOf("|")
            const andIndex = searchString.indexOf("&")

            // Assume nothing is coming up
            let toPush = searchString

            // Up to next & if it exists and is closer
            if ((orIndex > andIndex || orIndex < 0) && andIndex > -1) {
                toPush = searchString.substring(0, andIndex)
                i += andIndex - 1
            }

            // Up to next | if it exists and is closer
            else if ((orIndex < andIndex || andIndex < 0) && orIndex > -1) {
                toPush = searchString.substring(0, orIndex)
                i += orIndex - 1
            }

            // Whether should break after (no more to parse)
            let breakAfter = toPush === searchString
            
            // Deal with negation
            if (negate) {
                toPush = toPush.startsWith("!") ? toPush.substring(1) : "!" + toPush
            }

            // Put in array
            parsedArray.push(toPush)

            // No more to parse
            if (breakAfter) {
                break
            }

            continue
        }

        // Illegal token
        if (char !== "|" && char !== "&") {
            ThrowError(1125, { AT: string })
        }

        // Nothing before operator
        if (parsedArray.length === 0) {
            ThrowError(1130, { AT: string })
        }

        // Handle adding compound conditions
        const nextChar = string.charAt(i + 1)
        const prevChar = string.charAt(i - 1)

        // Invalid compound conditional
        if ((nextChar !== "!" && nextChar !== "$" && nextChar !== "[" && nextChar !== "@") || i === 0 || prevChar === "|" || prevChar === "&") {
            ThrowError(1130, { AT: string })
        }

        // Negate and/or
        if (negate) {
            char = char === "&" ? "|" : "&"
        }

        parsedArray.push(char)
    }

    return parsedArray
}

module.exports = parseConditionExpression