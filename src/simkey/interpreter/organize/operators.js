const ThrowError = require("../errors/ThrowError")

// Functions used for each assignment operator
const asnOperators = {
    "=": (input, variable, varName) => input,

    "+=": (input, variable, varName) => {
        if ((typeof variable === "string" && typeof input === "string") 
            || (typeof variable === "string" || typeof input === "string") 
            && (typeof variable === "number" || typeof input === "number")) {
            return String(variable) + String(input)
        }

        const result = Array.isArray(variable) ? variable[0] + input : variable + input
        if (isNaN(result) || result === Infinity) ThrowError(2705, { AT: "+=", VAR: varName })
        return result
    },

    "-=": (input, variable, varName) => {
        const result = Array.isArray(variable) ? variable[0] - input : variable - input
        if (isNaN(result) || result === Infinity) ThrowError(2705, { AT: "-=", VAR: varName })
        return result
    },

    "*=": (input, variable, varName) => {
        if (typeof variable === "string" && typeof input === "number" && !isNaN(input)) {
            return variable.repeat(input)
        }

        const result = Array.isArray(variable) ? variable[0] * input : variable * input
        if (isNaN(result) || result === Infinity) ThrowError(2705, { AT: "*=", VAR: varName })
        return result
    },

    "/=": (input, variable, varName) => {
        const result = Array.isArray(variable) ? variable[0] / input : variable / input
        if (isNaN(result) || result === Infinity) ThrowError(2705, { AT: "/=", VAR: varName })
        return result
    },

    "//=": (input, variable, varName) => {
        const result = Array.isArray(variable) ? Math.floor(variable[0] / input) : Math.floor(variable / input)
        if (isNaN(result) || result === Infinity) ThrowError(2705, { AT: "//=", VAR: varName })
        return result
    }
}

module.exports = asnOperators