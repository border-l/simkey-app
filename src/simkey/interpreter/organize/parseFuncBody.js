const ThrowError = require('../errors/ThrowError')
const combineTillNext = require("../helpers/combineTillNext")
const parseFuncParams = require("./parseFuncParams")

// Parses the body of a simkey func
function parseFuncBody(context, name, index, parseInnards, depth) {
    const [paramString, nextBracket] = combineTillNext(context, "start", index)
    const params = paramString === "none" ? [] : paramString.split(",").map(x => x.trim())

    if (nextBracket === -1) {
        ThrowError(1035, { AT: name })
    }

    const [block, newIndex] = parseInnards(context, nextBracket, depth)

    parseFuncParams(context, params)
    context.funcs[name] = [block, params]

    return newIndex
}

module.exports = parseFuncBody