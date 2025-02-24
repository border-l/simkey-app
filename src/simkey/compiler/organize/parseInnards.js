const findBracket = require("../helpers/findBracket")
const findNextSection = require("../helpers/findNextSection")
const combineTillNext = require("../helpers/combineTillNext")
const parseBuiltInFunctionCall = require("./parseBuiltInFunctionCall")
const parseImportedFunctionCall = require("./parseImportedFunctionCall")
const parseConditional = require("./parseConditional")
const parseExpression = require("./parseExpression")
const getArray = require("../types/getArray")
const ThrowError = require("../errors/ThrowError")

// Parses the bodies of functions & macro section (split it up)
function parseInnards(context, index, section) {
    const firstToken = context.tokens[index]
    const parsed = []
    let finalIndex

    // Find final index depending on bracket
    if (firstToken === "{") {
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
        
        // Token should be a flag
        if (token.charAt(0) === "$" && token.charAt(1) === "$") {
            // Invalid token, incomplete or should not be there
            if (token.length == 2) {
                ThrowError(3100, { AT: token })
            }

            // Declared outside of MACRO section
            if (section !== "MACRO") {
                ThrowError(1510, { AT: token })
            }

            // Flag already exists
            if (parsed.includes(token)) {
                ThrowError(1505, { AT: token })
            }

            parsed.push(token)
            continue
        }

        // Token is referring to a function
        if (token.charAt(0) === "@") {
            // Conditional "functions" handling
            if (token === "@if") {
                const [condParsed, newIndex] = parseConditional(context, i, section, parseInnards)
                parsed.push(condParsed)
                i = newIndex - 1
                continue
            }
            if (token === "@elseif" || token === "@else") {
                ThrowError(1040, { AT: token })
            }

            // Defined functions (this is somewhat repetitive later on, clean up later)
            if (context.model.FUNCS[token]) {
                if (context.model.FUNCS[token][1].length > 0) {
                    const [array, newIndex] = getArray(context, i + 1, false)
                    parsed.push([token, array])
                    i = newIndex
                    continue
                }

                parsed.push([token, []])
                continue
            }

            // Builtin functions
            if (context.builtIn.includes(token)) {
                i = parseBuiltInFunctionCall(context, parsed, token, i)
                continue
            }
            
            // Imported functions
            if (context.model.IMPORTS[token] && context.model.IMPORTS[token]["PARAMS"].length > 0) {
                i = parseImportedFunctionCall(context, token, parsed, i, parseInnards)
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
        ThrowError(1400, { AT: context.tokens[index - 1] + " " + context.tokens[index] })
    }

    // Parsed block and final index
    return [parsed, finalIndex]
}

module.exports = parseInnards