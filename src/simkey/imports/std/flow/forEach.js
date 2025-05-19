const checkVariableName = require("../../../interpreter/helpers/checkVariableName")

// Loop through block from start to end with step, with variable holding index
async function forEachLoop(INFO, BLOCK, loopVector, elementAndIndex) {
    let [element, index] = elementAndIndex.split(",")

    if (element + "," + index !== elementAndIndex) {
        throw new Error("Extra arguments given to @forEach loop: " + elementAndIndex)
    }

    // Get rid of extra spaces
    element = element.trim()
    index = index.trim()

    // Check that variable name is valid
    if (!checkVariableName(element)) {
        throw new Error("Variable name given to @forEach loop is not valid: " + element)
    }
    if (!checkVariableName(index)) {
        throw new Error("Variable name given to @forEach loop is not valid: " + index)
    }

    //  Set to default [0] if doesnt exist
    if (!Array.isArray(INFO.CONTEXT.variables[element])) {
        INFO.CONTEXT.variables[element] = [0]
    }
    if (!Array.isArray(INFO.CONTEXT.variables[index])) {
        INFO.CONTEXT.variables[index] = [0]
    }

    // Loop through with compare, incrementing by step
    for (let i = 0; i < loopVector.length; i++) {
        let value = loopVector[i]
        await INFO.RUN(INFO, [["SET", element, 0, () => value], ["SET", index, 0, () => i], ...BLOCK])
    }
}

module.exports = { FUNCTION: forEachLoop, TAKES: { PARAMS: "[VECTOR,LOOSE]", BLOCK: true } }