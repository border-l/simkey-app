const checkVariableName = require("../../compiler/helpers/checkVariableName")
const deepClone = require("./helpers/deepClone")

// Loop through block from start to end with step, with variable holding index
function forEachLoop(INFO, BLOCK, loopVector, elementAndIndex) {
    // Keep track of where to add instructions
    let INDEX = INFO.INDEX + 1

    let [element, index] = elementAndIndex.split(",")

    if (element + "," + index !== elementAndIndex) {
        throw new Error("Extra arguments given to @forEach loop: " + elementAndIndex)
    }

    // Get rid of extra spaces
    element = element.trim()
    index = index.trim()

    if (INFO.SETTINGS[element]) {
        throw new Error("Element variable is already a boolean: " + element)
    }
    if (INFO.SETTINGS[index]) {
        throw new Error("Index variable is already a boolean: " + index)
    }

    // Check that variable name is valid
    if (!checkVariableName(element)) {
        throw new Error("Variable name given to @forEach loop is not valid: " + element)
    }
    if (!checkVariableName(index)) {
        throw new Error("Variable name given to @forEach loop is not valid: " + index)
    }

    //  Set to default [0,0] if doesnt exist
    if (!INFO.VECTORS[element]) {
        INFO.VECTORS[element] = [0, 0]
    }
    if (!INFO.VECTORS[index]) {
        INFO.VECTORS[index] = [0, 0]
    }

    // Loop through with compare, incrementing by step
    for (let i = 0; i < loopVector.length; i++) {
        let value = loopVector[i]

        // Add block and deep clone it for next time
        INFO.LIST.splice(INDEX, 0, ["SET", element, 0, () => value], ["SET", index, 0, () => i], ...BLOCK)
        BLOCK = deepClone(BLOCK)

        // Move forward accordingly
        INDEX += BLOCK.length + 2
    }
}

module.exports = { FUNCTION: forEachLoop, TAKES: { PARAMS: "[VECTOR,LOOSE]", BLOCK: true } }