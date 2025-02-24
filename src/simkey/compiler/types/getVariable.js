const ThrowError = require("../errors/ThrowError")
const getVectorNumber = require("../types/getVectorNumber")

// Gets number value from vector
function getVariable(context, variable, expected) {
    let solution = undefined

    // Each possible expected type for getting value
    for (const expecter of expected) {
        // Get type regardless of optionality
        const expect = expecter.includes(":OPTIONAL") ? expecter.slice(0,-9) : expecter
    
        // Check for type num (getVectorNumber)
        if (expect === "NUM") {
            const vectorNum = getVectorNumber(context, variable, true)
            if (vectorNum === false) continue
            solution = vectorNum
            break
        }

        // Check for type bool (settings)
        else if (expect === "BOOL") {
            if (context.settings[variable] === undefined) continue
            solution = context.settings[variable]
            break
        }

        // Check for vector (VECTORS)
        else {
            if (!context.model.VECTORS[variable]) continue
            solution = context.model.VECTORS[variable]
            break
        }
    }

    // No value found compliant with expected types
    if (solution === undefined) {
        ThrowError(3005, { AT: `${variable}` })
    }

    // Solution exists
    return solution
}

module.exports = getVariable