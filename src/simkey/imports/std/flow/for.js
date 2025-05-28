const checkVariableName = require("../../../interpreter/helpers/checkVariableName")
const deepClone = require("../../../interpreter/helpers/deepClone")

// Loop through block from start to end with step, with variable holding index
async function forLoop(INFO, BLOCK, start, end, step, variable) {
    // No step of 0
    if (step === 0) {
        throw new Error("You cannot have a step of zero.")
    }

    // Get rid of extra spaces
    variable = variable.trim()

    // Check that variable name is valid
    if (!checkVariableName(variable)) {
        throw new Error("Variable name given to @for loop is not valid: " + variable)
    }
    // if (INFO.CONTEXT.variables[variable]) {
    //     throw new Error("Index variable is already a boolean: " + variable)
    // }

    // Check constant instead later

    //  Set to default [0] if doesnt exist
    if (!Array.isArray(INFO.CONTEXT.variables[variable])) {
        INFO.CONTEXT.variables[variable] = [0]
    }

    // Function to compare for loop
    let compare = (i) => i <= end

    // Set compare to be i >= end (since step < 1)
    if (start > end) {
        if (step > 0) {
            throw new Error("You cannot have positive step when you start is bigger than your end: [START=" + start + "] [END=" + end + "]")
        }
        compare = (i) => i >= end
    }

    // Negative step and start <= end, error
    else if (step < 0) {
        throw new Error("You cannot have negative step when you start is less than your end: " + step)
    }

    // Loop through with compare, incrementing by step
    for (let i = start; compare(i); i += step) {
        INFO.CONTEXT.variables[variable][0] = i
        const ended = await INFO.RUN(INFO, BLOCK)
        if (INFO.YIELD.END(ended)) break
        if (INFO.YIELD.RETURN(ended)) return ended
        if (INFO.CONTEXT.ABORT.signal.aborted) return
    }
}

module.exports = { FUNCTION: forLoop, TAKES: { PARAMS: "[NUM,NUM,NUM,LOOSE]", BLOCK: true } }