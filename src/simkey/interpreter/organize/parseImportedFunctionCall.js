const getArray = require("../types/getArray")
const getString = require("../types/getString")
const getVariable = require("../types/getVariable")
const checkVariableName = require("../helpers/checkVariableName")
const checkValidExpr = require("../helpers/checkValidExpr")
const evaluateExpr = require("../evaluator/evaluateExpr")
const findBracket = require("../helpers/findBracket")
const ThrowError = require("../errors/ThrowError")

// Parse imported function call for #parseInnards
function parseImportedFunctionCall(context, i, parseInnards, depth, ignoreBlock = false) {
    // Get parameters for function
    const token = context.tokens[i]
    const importParams = context.model.IMPORTS[token]["PARAMS"]

    // Block required, wrap arguments in brackets
    if (context.model.IMPORTS[token].BLOCK && context.tokens[i + 1] !== "start" && !ignoreBlock) {
        const nextBracket = context.tokens.indexOf("start", i + 1)
        if (nextBracket === -1) ThrowError(1035, { AT: token })
        context.tokens[i + 1] = "[" + context.tokens[i + 1]
        context.tokens[nextBracket - 1] += "]"
    }

    // No arguments
    else if (!context.tokens[i + 1] || !context.tokens[i + 1].startsWith("[")) {
        if (importParams.length !== 0 && !importParams[0][0].endsWith(":OPTIONAL")) {
            ThrowError(2100, { AT: token })
        }

        if (context.model.IMPORTS[token].BLOCK) {
            if (context.tokens[i + 1] !== "start" || ignoreBlock) {
                ThrowError(1035, { AT: token })
            }

            if (context.model.IMPORTS[token].DONT_PARSE_BLOCK) {
                const closeIndex = findBracket(context, i + 1)
                if (closeIndex == -1) ThrowError(1015, { AT: token })

                return [[token, { args: [], block: context.tokens.slice(i + 2, closeIndex) }], closeIndex]
                // parsed.push([token, { args: [], block: context.tokens.slice(i + 2, closeIndex) }])
                // return closeIndex
            }

            const [parsedBlock, newerIndex] = parseInnards(context, i + 1, depth)
            return [[token, { args: [], block: parsedBlock }], newerIndex]
            // parsed.push([token, { args: [], block: parsedBlock }])
            // return newerIndex
        }

        return [[token, { args: [], block: [] }], i]
        // parsed.push([token, { args: [], block: [] }])
        // return i
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
                finalArray.push((context) => getVariable(context, arg, expectedArray))
                break
            }

            // Handle booleans
            if (expected === "BOOL") {
                if (checkVariableName(arg)) {
                    finalArray.push((context) => getVariable(context, arg, expectedArray))
                    break
                }

                // Valid expression
                if (checkValidExpr(arg, true)) {
                    finalArray.push((context) => evaluateExpr(context, arg, true))
                    break
                }

                // Not a literal boolean
                if (arg !== "true" && arg !== "false") {
                    continue
                }

                finalArray.push(arg === "true")
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
                    finalArray.push((context) => evaluateExpr(context, arg))
                    break
                }

                // Must be a variable by itself
                if (!checkVariableName(arg, true)) {
                    continue
                }

                finalArray.push((context) => getVariable(context, arg, expectedArray))
                break
            }

            // Handle strings
            if (expected === "STR") {
                // String variable
                if (checkVariableName(arg.trim(), true)) {
                    finalArray.push((context) => getVariable(context, arg.trim(), expectedArray))
                    break
                }

                // Try to get the string, if error, not a string
                try {
                    const [string, finalIndex] = getString(context, x, value, ",")
                    finalArray.push(string)
                    x = finalIndex
                    break
                }
                catch (error) {
                    continue
                }
            }

            // Table type (general object)
            if (expected === "TABLE") {
                if (!checkVariableName(arg, true)) continue
                finalArray.push((context) => getVariable(context, arg, expectedArray))
                break
            }

            // Handling Loose type
            finalArray.push(value.slice(x).join(","))
            x = value.length
            break
        }

        // No new element added so nothing matched, invalid type
        if (finalArray.length === prevSize) {
            ThrowError(2110, { AT: `${token} as argument to ${token}`, ARG: arg, EXPECTED: expectedArray })
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
        return [[token, { args: finalArray, block: [] }], newIndex]
        // parsed.push([token, { args: finalArray, block: [] }])
        // return newIndex
    }

    // Doesnt have block even though required
    if (context.tokens[newIndex + 1] !== "start" || ignoreBlock) {
        ThrowError(1035, { AT: token })
    }

    // Not necessary to parse, just use newerIndex to give tokens
    if (context.model.IMPORTS[token].DONT_PARSE_BLOCK) {
        // Get close index, check if it exists
        const closeIndex = findBracket(context, newIndex + 1)
        if (closeIndex == -1) ThrowError(1015, { AT: token })

        return [[token, { args: finalArray, block: context.tokens.slice(newIndex + 2, closeIndex) }], closeIndex]
        // // Give tokens in block
        // parsed.push([token, { args: finalArray, block: context.tokens.slice(newIndex + 2, closeIndex) }])

        // // Move index along
        // return closeIndex
    }

    // Parse insides of block
    const [parsedBlock, newerIndex] = parseInnards(context, newIndex + 1, depth)
    return [[token, { args: finalArray, block: parsedBlock }], newerIndex]
    // // Give parsed block
    // parsed.push([token, { args: finalArray, block: parsedBlock }])

    // // Move index along
    // return newerIndex
}

module.exports = parseImportedFunctionCall