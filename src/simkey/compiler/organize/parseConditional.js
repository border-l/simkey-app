const combineTillNext = require("../helpers/combineTillNext")
const findBracket = require("../helpers/findBracket")
const parseConditionExpression = require("./parseConditionExpression")

// Parses conditional models, using #parseConditionExpression for expressions
function parseConditional (context, index, section, parseInnards) {
    // Three array structure (conditional, expression, block)
    const parsed = [[], [], []]
    let i = index

    while (true) {
        // Get condition, function, and both brackets
        const conditionFunction = context.tokens[i]
        const [condition, nextBracket] = combineTillNext(context, "{", i, false)
        const closeBracket = findBracket(context, nextBracket)

        // Handle conditions for everything but else
        if (conditionFunction !== "@else") {
            // No condition
            if (condition.length === 0) {
                ThrowError(1025, { AT: conditionFunction + " " + context.tokens[i + 1] })
            }

            // Parse the condition expression
            const parsedCondition = parseConditionExpression(context, condition)

            // Invalid condition [This seems impossible? [Why would it be?]]
            if (!parsedCondition) {
                ThrowError(1130, { AT: condition })
            }

            // Add function and parsed condition
            parsed[0].push(conditionFunction)
            parsed[1].push(parsedCondition)
            
            // Add conditional branch block
            parsed[2].push(parseInnards(context, nextBracket, section)[0])
        }

        // No condition for else as should be
        else if (condition === '') {
            parsed[0].push('@else')
            parsed[2].push(parseInnards(context, nextBracket, section)[0])
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