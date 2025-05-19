const findBracket = require("../helpers/findBracket")
const findNextSection = require("../helpers/findNextSection")
const combineTillNext = require("../helpers/combineTillNext")
const parseImportedFunctionCall = require("./parseImportedFunctionCall")
const parseConditional = require("./parseConditional")
const parseExpression = require("./parseExpression")
const getArray = require("../types/getArray")
const ThrowError = require("../errors/ThrowError")
const checkVariableName = require("../helpers/checkVariableName")
const asnOperators = require('./operators')
const getBalanced = require('../helpers/getBalanced')
const parseFuncBody = require("./parseFuncBody")
const getValueExpression = require("./getValueExpression")

// Parses the bodies of functions & macro section (split it up)
function parseInnards(context, index, depth) {
    const firstToken = context.tokens[index]
    const parsed = []
    let finalIndex

    // Find final index depending on bracket
    if (firstToken === "start") {
        finalIndex = findBracket(context, index)
    }
    else {
        finalIndex = findNextSection(context, index)
    }

    // No valid final index found
    if (finalIndex === -1) {
        ThrowError(1015, { AT: `Token: ${firstToken}, Context: ${context}` })
    }

    let i = index + 1
    for (; i < finalIndex; i++) {
        const token = context.tokens[i]

        // Skip past comments
        if (token === "#") {
            const [_, newIndex] = combineTillNext(context, "#", i, true)
            i = newIndex
            continue
        }

        // Variable assignment
        if (token === "final" || (token[0] === "$" && asnOperators[context.tokens[i + 1]])) {
            const [isConst, varName, opToken, next] = token === "final" ?
                [true, context.tokens[i + 1], context.tokens[i + 2], i + 3] :
                [false, token, context.tokens[i + 1], i + 2]

            // Missing parts
            if (next >= finalIndex) {
                ThrowError(1605, { AT: varName === undefined ? "variable name missing" : varName })
            }

            if (!checkVariableName(varName, true)) ThrowError(1100, { AT: varName + " (in assignment)" })
            const operator = asnOperators[opToken]

            // const keyword used and then invalid assignment operator
            if (operator === undefined) {
                ThrowError(1610, { AT: varName + " " + opToken })
            }

            const [value, newIndex] = getValueExpression(context, next)
            parsed.push(["ASSN" + (isConst ? "C" : ""), varName, operator, value])
            i = newIndex
            continue
        }

        // Token is referring to a function
        if (token.charAt(0) === "@") {
            // Conditional "functions" handling
            if (token === "@if") {
                const [condParsed, newIndex] = parseConditional(context, i, parseInnards, depth + 1)
                parsed.push(condParsed)
                i = newIndex - 1
                continue
            }
            if (token === "@elseif" || token === "@else") {
                ThrowError(1045, { AT: token })
            }

            // Return statement
            if (token === "@return") {
                if (depth < 2) {
                    ThrowError(1700, { AT: token + " " + context.tokens[i + 1] })
                }

                if (i >= finalIndex - 1) {
                    ThrowError(2805, {})
                }

                const [value, newIndex] = getValueExpression(context, i + 1)
                parsed.push(["RET", value])
                i = newIndex
                continue
            }

            // Function definition
            if (context.tokens[i + 1] === "takes") {
                if (depth !== 1) {
                    ThrowError(1515, { AT: token })
                }
                i = parseFuncBody(context, token, i + 1, parseInnards, depth + 1)
                continue
            }

            // Defined functions (this is somewhat repetitive later on, clean up later)
            if (context.funcs[token]) {
                if (context.funcs[token][1].length > 0) {
                    const [array, newIndex] = getArray(context, i + 1, false)
                    parsed.push([token, array])
                    i = newIndex
                    continue
                }

                parsed.push([token, []])
                continue
            }

            if (token === "@end") {
                parsed.push("@end")
                return [parsed, finalIndex]
            }

            if (token === "@next") {
                parsed.push("@next")
                return [parsed, finalIndex]
            }

            // Imported functions
            if (context.model.IMPORTS[token]) {
                const [instruction, newIndex] = parseImportedFunctionCall(context, i, parseInnards, depth + 1)
                parsed.push(instruction)
                i = newIndex
                continue
            }

            // Doesnt fit above categories, check later
            if (!context.checkLater.includes(token)) {
                context.checkLater.push(token)
            }

            // Yet to be defined
            if (context.tokens.length > (i + 1) && context.tokens[i + 1].startsWith("[")) {
                const [array, newIndex] = getArray(context, i + 1, false)
                parsed.push([token, array])
                i = newIndex
                continue
            }

            parsed.push([token, []])
            continue
        }

        // None of the above means it is an expression
        const parsedExpression = parseExpression(context, token)

        // Invalid expression [This seems impossible? [Why would it be?]]
        if (!parsedExpression) {
            ThrowError(1110, { AT: token })
        }

        parsed.push(parsedExpression)
    }

    // Code went past block
    if (i > finalIndex) {
        ThrowError(1400, { AT: (context.tokens[index - 1] || context.tokens.at(-2)) + " " + (context.tokens[index] || context.tokens.at(-1)) })
    }

    // Parsed block and final index
    return [parsed, finalIndex]
}

module.exports = parseInnards