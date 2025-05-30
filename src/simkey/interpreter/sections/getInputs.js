const deepClone = require("../helpers/deepClone")

function getInputs(context) {
    const VARIABLES = {}

    const { MODES, SWITCHES, VECTORS, NUMBERS, STRINGS} = context.model.INPUTS
    for (const key in context.variables) {
        if (MODES.includes(key) || SWITCHES.includes(key) || VECTORS[key] !== undefined || NUMBERS[key] !== undefined || STRINGS.includes(key))
            VARIABLES[key] = deepClone(context.variables[key])
    }

    return { INPUTS: deepClone(context.model.INPUTS), VARIABLES }
}

module.exports = getInputs