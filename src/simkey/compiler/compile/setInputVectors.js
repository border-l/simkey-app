const ThrowError = require("../errors/ThrowError")

// Set settings to be used when compiling script
function setInputVectors (context, object) {
    // Go through vectors
    for (const vector in object) {
        const vectorArray = object[vector]
        const fromInput = context.inputVectors[vector]

        // Validate data
        if (!fromInput) {
            ThrowError(5400, { AT: vector })
        }
        if (!Array.isArray(vectorArray)) {
            ThrowError(5405, { AT: vector })
        }
        if (vectorArray.length !== fromInput.length) {
            ThrowError(5410, { AT: vector })
        }
        if (vectorArray.some((val) => (isNaN(val) || val === ""))) {
            ThrowError(5410, { AT: vector })
        }

        // Deep copy, make sure it is at least length 2
        let newArray = JSON.parse(JSON.stringify(vectorArray.map((val) => val.length === 0 ? 0 : Number(val))))
        if (newArray.length < 2) newArray.push(0)

        context.model.VECTORS[vector] = newArray
    }
}

module.exports = setInputVectors