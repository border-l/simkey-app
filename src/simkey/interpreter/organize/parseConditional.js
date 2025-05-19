const parseImportedFunctionCall = require('./parseImportedFunctionCall')
const combineTillNext = require("../helpers/combineTillNext")
const findBracket = require("../helpers/findBracket")
const ThrowError = require("../errors/ThrowError")
const getArray = require('../types/getArray')

// Parses conditional models, using #parseConditionExpression for expressions
function parseConditional(context, index, parseInnards, depth) {
    // Three array structure (conditional, expression, block)
    const parsed = [[], [], []]
    let i = index

    while (true) {
        // Get condition, function, and both brackets
        const conditionFunction = context.tokens[i]
        const [condition, nextBracket] = combineTillNext(context, "start", i, false)
        const closeBracket = findBracket(context, nextBracket)

        if (nextBracket === -1) {
            ThrowError(1040, { AT: condition + " " + conditionFunction })
        }

        // Handle conditions for everything but else
        if (conditionFunction !== "@else") {
            // No condition
            if (condition.length === 0) {
                ThrowError(1025, { AT: conditionFunction + " " + context.tokens[i + 1] })
            }

            // Add function, parsed condition gets pushed later
            parsed[0].push(conditionFunction)

            // Function as condition
            if (condition[0] === "@") {
                const funcName = condition.slice(0, condition.indexOf(" ") > -1 ? condition.indexOf(" ") : condition.length)

                // Imported JS function
                if (context.model.IMPORTS[funcName]) {
                    const [instruction, newIndex] = parseImportedFunctionCall(context, i + 1, parseInnards, depth, true)

                    // Extended past bracket
                    if (newIndex > nextBracket) {
                        ThrowError(1005, { AT: condition })
                    }

                    parsed[1].push(instruction)
                }

                // Native simkey function
                else {
                    if (nextBracket === i + 2) {
                        parsed[1].push([funcName, []])
                    }

                    else {
                        const [array, newIndex] = getArray(context, i + 2, false)

                        // Extended past bracket
                        if (newIndex > nextBracket) {
                            ThrowError(1005, { AT: condition })
                        }

                        parsed[1].push([funcName, array])
                    }
                }
            }

            // Just a regular expression
            else {
                parsed[1].push(condition)
            }

            // Add conditional branch block
            parsed[2].push(parseInnards(context, nextBracket, depth)[0])
        }

        // No condition for else as should be
        else if (condition === '') {
            parsed[0].push('@else')
            parsed[2].push(parseInnards(context, nextBracket, depth)[0])
            i = closeBracket + 1
            break
        }

        // Otherwise else is given a condition
        else {
            ThrowError(1120, { AT: condition })
        }

        // No more conditional branches
        if (context.tokens[closeBracket + 1] !== "@elseif" && context.tokens[closeBracket + 1] !== "@else") {
            i = closeBracket + 1
            break
        }

        i = closeBracket + 1
    }

    // Parsed and move along
    return [parsed, i]
}

module.exports = parseConditional