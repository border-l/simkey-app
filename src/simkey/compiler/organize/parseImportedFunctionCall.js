const getArray = require("../types/getArray")
const getString = require("../types/getString")
const getVariable = require("../types/getVariable")
const checkVariableName = require("../helpers/checkVariableName")
const checkValidExpr = require("../helpers/checkValidExpr")
const evaluateExpr = require("../helpers/evaluateExpr")
const findBracket = require("../helpers/findBracket")
const ThrowError = require("../errors/ThrowError")

// Parse imported function call for #parseInnards
module.exports = (context, token, parsed, i, parseInnards, section) => {
    // Get parameters for function
    const importParams = context.model.IMPORTS[token]["PARAMS"]

    // No arguments
    if (!context.tokens[i + 1].startsWith("[")) {
        // No need for arguments, otherwise error
        if (importParams[0][0].endsWith(":OPTIONAL")) {
            parsed.push([token, []])
            return i
        }

        ThrowError(2100, { AT: token })
    }

    // Values & final
    const [value, newIndex] = getArray(context, i + 1, false)
    let finalArray = []

    // Through arguments
    for (let x = 0; x < value.length; x++) {
        let arg = value[x]

        // Extra arguments
        if (finalArray.length === importParams.length) {
            ThrowError(2105, { AT: token })
        }

        // Array for types
        let expectedArray = importParams[finalArray.length]
        let prevSize = finalArray.length

        // Through valid types
        for (let z = 0; z < expectedArray.length; z++) {
            // Expected type for z
            let expected = expectedArray[z]
            expected = expected.endsWith(":OPTIONAL") ? expected.substring(0, expected.length - ":OPTIONAL".length) : expected

            // Everything other than strings can be trimmed
            if (expected !== "STR") {
                arg = arg.trim()
            }

            // Handle vectors
            if (expected === "VECTOR") {
                if (!checkVariableName(arg)) {
                    continue
                }

                // Changed way of retrieving vector after the fact
                finalArray.push(getVariable.bind(null, context, arg, expectedArray))
                break
            }

            // Handle booleans
            if (expected === "BOOL") {
                if (checkVariableName(arg)) {
                    finalArray.push(getVariable.bind(null, context, arg, expectedArray))
                    break
                }

                // Valid expression
                if (checkValidExpr(arg, true)) {
                    finalArray.push(evaluateExpr.bind(null, context, arg, true))
                    break
                }

                // Not a literal boolean
                if (arg !== "TRUE" && arg !== "FALSE") {
                    continue
                }

                finalArray.push(arg === "TRUE" ? true : false)
                break
            }

            // Handle numbers
            if (expected === "NUM") {
                // Literal number
                if (!isNaN(Number(arg))) {
                    finalArray.push(Number(arg))
                    break
                }

                // Valid expression
                if (checkValidExpr(arg)) {
                    finalArray.push(evaluateExpr.bind(null, context, arg))
                    break
                }

                // Must be a variable by itself
                if (!checkVariableName(arg, true)) {
                    continue
                }

                finalArray.push(getVariable.bind(null, context, arg, expectedArray))
                break
            }

            // Handle strings
            if (expected === "STR") {
                // Try to get the string, if error, not a string
                try {
                    const [string, finalIndex] = getString(context, x, value, true)
                    finalArray.push(string)
                    x = finalIndex
                    break
                }
                catch (error) {
                    continue
                }
            }

            // Handling Loose type
            finalArray.push(value.slice(x).join(","))
            x = value.length
            break
        }

        // No new element added so nothing matched, invalid type
        if (finalArray.length === prevSize) {
            ThrowError(2110, { AT: token, ARG: arg, EXPECTED: expectedArray })
        }
    }

    // Get optional index for finding needed length right after
    let optionalIndex = importParams.reduce((foundIndex, elementArray, curIndex) => {
                            if (foundIndex !== -1) return foundIndex;
                            const index = elementArray.findIndex((val) => val.endsWith(":OPTIONAL"));
                            return index !== -1 ? curIndex : -1;
                        }, -1)
    let neededLength = optionalIndex > -1 ? optionalIndex : importParams.length

    // Not enough arguments were given
    if (finalArray.length < neededLength) {
        ThrowError(2100, { AT: token })
    }

    // No block necessary
    if (!context.model.IMPORTS[token]["BLOCK"]) {
        parsed.push([token, finalArray])
        return newIndex
    }

    // Doesnt have block even though its required
    if (context.tokens[newIndex + 1] !== "{") {
        ThrowError(1035, { AT: token })
    }

    // Not necessary to parse, just use newerIndex to give tokens
    if (context.model.IMPORTS[token].DONT_PARSE_BLOCK) {
        // Get close index, check if it exists
        const closeIndex = findBracket(context, newIndex + 1)
        if (closeIndex == -1) ThrowError(1015, { AT: token })

        // Give tokens in block
        parsed.push([token, finalArray, context.tokens.slice(newIndex + 2, closeIndex)])

        // Move index along
        return closeIndex
    }

    // Parse insides of block
    const [parsedBlock, newerIndex] = parseInnards(context, newIndex + 1, section)

    // Give parsed block
    parsed.push([token, finalArray, parsedBlock])

    // Move index along
    return newerIndex
}