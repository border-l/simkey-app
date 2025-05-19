const getArray = require('../types/getArray')
const getString = require('../types/getString')
const getBalanced = require('../helpers/getBalanced')
const NEXT_INSTRUCTION = require("../helpers/NEXT_INSTRUCTION")
const STRING_MARKER = require("../helpers/STRING_MARKER")
const ThrowError = require('../errors/ThrowError')

// This is for expressions used in assignment and return statements
function getValueExpression(context, index) {
    // Output of a function
    if (context.tokens[index][0] === "@") {
        return [new NEXT_INSTRUCTION(), index - 1]
    }

    // Whole vector
    else if (context.tokens[index][0] === "[") {
        return getArray(context, index, true)
    }

    // Expression with spaces
    else if (context.tokens[index][0] === "(") {
        const result = getBalanced(index, context.tokens)
        if (result[0].at(-1) !== ")") ThrowError(1115, { AT: result[0] })
        return result
    }

    // Literal string
    else if (context.tokens[index][0] === '"') {
        const [string, newIndex] = getString(context, index)
        return [new STRING_MARKER(string), newIndex]
    }

    // Expression without spaces
    else {
        return [context.tokens[index], index]
    }
}

module.exports = getValueExpression