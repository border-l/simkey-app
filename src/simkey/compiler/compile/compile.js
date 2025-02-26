const organize = require("../organize/organize")
const checkFunctionReferences = require("../helpers/checkFunctionReferences")
const getInstructionList = require("./getInstructionList")
const compileExpressionObject = require("./compileExpressionObject")
const checkValidImportReturn = require("../helpers/checkValidImportReturn")
const solveConditional = require("./solveConditional")
const handleSET = require("./handleSET")
const ThrowError = require("../errors/ThrowError")

const fs = require("fs")

// Compiles the file
module.exports = (context, fileName) => {
    // Settings must be set first
    if (!context.settings) {
        return
    }

    // Organize and check that function references are valid
    organize(context)
    checkFunctionReferences(context)

    // Get instruction list and set object for info shared between imports
    const instructionList = getInstructionList(context, context.model.MACRO, "MACRO")

    // Info for parsing sequences
    let def = [100, 100]
    let code = "START"
    let heldKeys = []

    const sharedSpace = {}

    // Handle each instruction
    for (let i = 0; i < instructionList.length; i++) {
        const instruction = instructionList[i]

        // Key expression object
        if (instruction instanceof Object && !Array.isArray(instruction)) {
            code += compileExpressionObject(instruction, heldKeys, def)
            continue
        }

        const func = instruction[0]

        // End
        if (instruction === "@end") {
            break
        }

        // Otherwise, handle imported function call
        let result

        const passedInfo = {
            DEF: def,
            LIST: instructionList,
            INDEX: i,
            IMPORTS: context.model.IMPORTS,
            SETTINGS: context.settings,
            MODES: context.model.MODES,
            SWITCHES: context.model.SWITCHES,
            VECTORS: context.model.VECTORS,
            CODE: code,
            SHARED: sharedSpace
        }

        // No arguments
        if (func.length === 1 && typeof func === "string") {
            result = context.model.IMPORTS[instruction.substring(1)](passedInfo)
        }

        // Handle conditional
        else if (Array.isArray(func)) {
            for (let x = 0; x < func.length; x++) {
                // Branch should not be run
                if (func[x] !== "@else" && !solveConditional(context, passedInfo, instruction[1][x])) {
                    continue
                }

                // Add block of branch
                instructionList.splice(i + 1, 0, ...getInstructionList(context, instruction[2][x], "MACRO"))
                break
            }
        }

        // Special case, SET function
        else if (func === "SET") {
            handleSET(context, instruction)
        }

        // Doesnt contain parameters where it should
        else if (!Array.isArray(instruction[1])) {
            ThrowError(5205, { AT: func })
        }

        // Imported function
        else {
            // Add to this as to not mutate original
            const newInstructions = []

            // Call each of the getVectorNumber binded functions
            for (let ind = 0; ind < instruction[1].length; ind++) {
                // Value func, append value from function to newInstructions
                if (typeof instruction[1][ind] === "function") {
                    newInstructions[ind] = instruction[1][ind]()
                }
                // Push as is since it is not a function
                else {
                    newInstructions.push(instruction[1][ind])
                }

                // Cannot be undefined
                if (newInstructions[ind] === undefined) {
                    ThrowError(2115, { AT: func })
                }
            }

            // Get result with arguments
            if (instruction[2] !== undefined) {
                // Get the instructions or not depending on DONT_PARSE_BLOCK
                const passedBlock = context.model.IMPORTS[func].DONT_PARSE_BLOCK ? instruction[2] : getInstructionList(context, instruction[2], "MACRO")
                result = context.model.IMPORTS[func.substring(1)](passedInfo, passedBlock, ...newInstructions)
            }
            else {
                result = context.model.IMPORTS[func.substring(1)](passedInfo, ...newInstructions)
            }
        }

        // Check the return value
        checkValidImportReturn(result, func.length === 1 ? instruction : func)

        // No result, continue
        if (!result) {
            continue
        }

        // Set code all to this
        if (result.startsWith("START")) {
            code = result
        }
        // Append to code
        else if (result.startsWith("\n")) {
            code += result
        }
        // Append to code and new line
        else {
            code += "\n" + result
        }
    }

    // Release all held down keys
    for (const key of heldKeys) {
        code += "\nr" + (key.endsWith("|") ? key.substring(0, key.length - 1) : key)
    }

    // Save to file and return its name
    fs.writeFileSync(fileName, code.substring(6))
    return fileName
}