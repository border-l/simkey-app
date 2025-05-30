const parseSection = require("./parseSection")
const getArray = require('../types/getArray')
const getString = require('../types/getString')
const ThrowError = require("../errors/ThrowError")
const evaluateExpr = require('../evaluator/evaluateExpr')
const checkVariableName = require("../helpers/checkVariableName")

// Handles inputs section
function parseInputs(context) {
    let modeOn = false
    let hasPassed = false

    parseSection(context, (tokens, token, i, section, next) => {
        // variable name and type of input (as a key in model.INPUTS)
        const varn = tokens[i + 1]
        const type = token === "SWITCH" ? token + "ES" : token + "S"

        if (varn === undefined) ThrowError(1100, { AT: "no name given in <INPUTS> after " + type + "." })

        // Invalid name or already declared
        if (!checkVariableName(varn)) ThrowError(1100, { AT: varn })
        if (context.variables[varn]) ThrowError(1500, { AT: varn })

        // Same handling
        if (token === "MODE" || token === "SWITCH") {
            hasPassed = hasPassed || token === "MODE"

            context.model.INPUTS[type].push(varn)
            context.constants.push(varn)

            let retIndex = i + 1

            if (tokens.length > i + 2 && tokens[i + 2] === "DEFAULT") {
                if (modeOn && token === "MODE") ThrowError(5005, { AT: varn })
                if (token === "MODE") modeOn = true

                context.variables[varn] = true
                retIndex = i + 2
            }
            else context.variables[varn] = false

            return getInputMeta(context, retIndex + 1, next, context.model.INPUTS.META, varn) || retIndex
        }

        // Takes bounds and array
        if (token === "VECTOR") {
            if (tokens.length <= i + 2) ThrowError(2900, { AT: varn, REASON: "no bounds given." })

            const bounds = tokens[i + 2].split(",").map(x => x === "" ? null : Number(x))

            // Bound validation (0 <= 1, 0 && 1 nums (so long as 1 not null), length > 2)
            if (bounds.length > 2) ThrowError(2900, { AT: tokens[i + 2], REASON: "more than 2 bounds given." })
            if (isNaN(bounds[0]) || (isNaN(bounds[1]) && bounds[1] !== null)) ThrowError(2900, { AT: tokens[i + 2], REASON: "bound given is not a number." })
            if (bounds[0] < 1 || (bounds[0] > bounds[1] && bounds[1] !== null)) ThrowError(2900, { AT: tokens[i + 2], REASON: "first bound is less than one or bigger than second." })

            if (bounds.length < 2) bounds.push(bounds[0])

            if (!tokens[i + 3].startsWith("[")) ThrowError(2910, { AT: varn, REASON: "no opening bracket." })

            const [array, index] = getArray(context, i + 3)
            if (index >= next) ThrowError(1400, { AT: varn })

            try {
                for (let x = 0; x < array.length; x++) {
                    array[x] = evaluateExpr(context, array[x])
                    if (array[x] < bounds[0] || (array[x] > bounds[1] && bounds[1] !== null))
                        ThrowError(2910, { AT: array[x], REASON: "value does not fit within bounds." })
                }
            } catch (err) { ThrowError(1115, { AT: varn }) }

            context.model.INPUTS[type][varn] = bounds
            context.variables[varn] = array
            context.constants.push(varn)
            return getInputMeta(context, index + 1, next, context.model.INPUTS.META, varn) || index
        }

        // Takes string
        if (token === "STRING") {
            if (!tokens[i + 2].startsWith('"')) ThrowError(2910, { AT: varn, REASON: "no starting quote." })

            const [string, index] = getString(context, i + 2)
            if (index >= next) ThrowError(1400, { AT: varn })

            context.model.INPUTS[type].push(varn)
            context.variables[varn] = string
            context.constants.push(varn)
            return getInputMeta(context, index + 1, next, context.model.INPUTS.META, varn) || index
        }

        // Takes num
        if (token === "NUMBER") {
            if (tokens.length <= i + 2) ThrowError(2910, { AT: varn, REASON: "no bounds given." })

            const bounds = tokens[i + 2].split(",").map(x => x === "" ? null : Number(x))

            // Bound validation (0 <= 1, 0 && 1 nums (so long as 1 not null), length > 2)
            if (bounds.length > 2) ThrowError(2900, { AT: tokens[i + 2], REASON: "more than 2 bounds given." })
            if (isNaN(bounds[0]) || (isNaN(bounds[1]) && bounds[1] !== null)) ThrowError(2900, { AT: tokens[i + 2], REASON: "bound given is not a number." })
            if (bounds[0] > bounds[1] && bounds[1] !== null) ThrowError(2900, { AT: tokens[i + 2], REASON: "first bound is bigger than second." })

            if (bounds.length < 2) bounds.push(bounds[0])

            if (tokens.length <= i + 3) ThrowError(2910, { AT: varn, REASON: "no value given." })

            const defaultNum = Number(tokens[i + 3])
            if (isNaN(defaultNum)) ThrowError(2910, { AT: tokens[i + 3], REASON: "value given is not a number." })
            if (defaultNum < bounds[0] || (defaultNum > bounds[1] && bounds[1] !== null))
                ThrowError(2910, { AT: tokens[i + 3], REASON: "value does not fit within bounds." })

            context.model.INPUTS[type][varn] = bounds
            context.variables[varn] = defaultNum
            context.constants.push(varn)
            return getInputMeta(context, i + 4, next, context.model.INPUTS.META, varn) || i + 3
        }

        ThrowError(2905, { AT: token })
    }, (section) => section === "INPUTS")

    if (!modeOn && hasPassed) ThrowError(5015, {})
}


// Gets the name & description for the input if they exist
function getInputMeta(context, startIndex, nextSection, meta, varName) {
    const tokens = context.tokens
    if (tokens.length <= startIndex || !tokens[startIndex].startsWith('"')) return

    const [name, indexName] = getString(context, startIndex)
    if (indexName >= nextSection) ThrowError(1400, { AT: varName })

    meta[varName] = { name }

    if (tokens.length <= indexName + 1 || !tokens[indexName + 1].startsWith('"')) return indexName
    const [desc, indexDesc] = getString(context, indexName + 1)
    if (indexDesc >= nextSection) ThrowError(1400, { AT: varName })

    meta[varName].description = desc

    return indexDesc
}

module.exports = parseInputs