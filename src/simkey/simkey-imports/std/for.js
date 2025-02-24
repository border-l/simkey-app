const checkVariableName = require("../../compiler/helpers/checkVariableName")
const deepClone = require("./helpers/deepClone")

// Loop through block from start to end with step, with variable holding index
function forLoop(INFO, BLOCK, start, end, step, variable) {
    // Keep track of where to add instructions
    let index = INFO.INDEX + 1

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
    if (INFO.SETTINGS[variable]) {
        throw new Error("Index variable is already a boolean: " + variable)
    }
    
    //  Set to default [0,0] if doesnt exist
    if (!INFO.VECTORS[variable]) {
        INFO.VECTORS[variable] = [0,0]
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
        // Add block and deep clone it for next time
        INFO.LIST.splice(index, 0, ["@set", [variable + "," + i.toString()]], ...BLOCK)
        BLOCK = deepClone(BLOCK)

        // Move forward accordingly
        index += BLOCK.length + 1
    }
}

module.exports = { FUNCTION: forLoop, TAKES: { PARAMS: "[NUM,NUM,NUM,LOOSE]", BLOCK: true } }