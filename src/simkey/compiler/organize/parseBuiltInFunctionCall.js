const ThrowError = require("../errors/ThrowError")

// parse built-in function calls for #parseInnards
module.exports = (context, parsed, token, i) => {
    const nextArgument = context.tokens[i + 1]

    // @end handling
    if (token === "@end") {
        parsed.push("@end")
        return i
    }

    // No arguments to function as no next token
    if (i >= context.tokens.length - 1) {
        ThrowError(2100, { AT: token })
    }

    // @goto call is invalid, not a right flag
    if (!nextArgument.startsWith("$$") || context.tokens.lastIndexOf(nextArgument) === i + 1) {
        ThrowError(3000, { AT: nextArgument })
    }

    // Only @goto left as an option
    parsed.push(["@goto", nextArgument])
    i++

    // Move index along
    return i
}