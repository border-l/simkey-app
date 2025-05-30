const ThrowError = require("../errors/ThrowError")

// Function to set the value of the inputs
function setInputs(context, inputs) {
    let setMode = false

    // Reset modes and make sure they are set to false
    context.model.INPUTS.MODES.forEach(val => context.variables[val] = false)

    for (const input in inputs) {
        const value = inputs[input]

        if (Array.isArray(value)) {
            const bounds = context.model.INPUTS.VECTORS[input]

            if (!bounds) {
                ThrowError(5000, { AT: input })
            }

            if (value.length < bounds[0] || value.length > bounds[1]) {
                ThrowError(5010, { AT: input, REASON: `given array does not fit bounds, length ${value.length}, minimum ${bounds[0]}, maximum ${bounds[1]}` })
            }

            if (value.some(val => isNaN(val) || typeof val !== "number")) {
                ThrowError(5010, { AT: input, REASON: "given array that has non-numbers." })
            }

            context.variables[input] = value
        }

        else if (typeof value === "string") {
            if (!context.model.INPUTS.STRINGS.includes(input)) {
                ThrowError(5000, { AT: input })
            }

            context.variables[input] = value
        }

        else if (typeof value === "boolean") {
            if (context.model.INPUTS.MODES.includes(input)) {
                if (setMode) ThrowError(5005, { AT: input })
                setMode = true
            }

            else if (!context.model.INPUTS.SWITCHES.includes(input)) {
                ThrowError(5000, { AT: input })
            }

            context.variables[input] = value
        }

        else if (typeof value === "number" && !isNaN(value)) {
            const bounds = context.model.INPUTS.NUMBERS[input]

            if (!bounds) {
                ThrowError(5000, { AT: input })
            }

            if (value < bounds[0] || value > bounds[1]) {
                ThrowError(5010, { AT: input, REASON: `number is not within bounds, number ${value}, minimum ${bounds[0]}, maximum ${bounds[1]}` })
            }

            context.variables[input] = value
        }

        else {
            ThrowError(5010, { AT: input, REASON: "value given is not a string, boolean, number, or number array." })
        }
    }
}

module.exports = setInputs