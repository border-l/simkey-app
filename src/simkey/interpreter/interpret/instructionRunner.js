const setFuncCallParams = require("./setFuncCallParams")
const runExpressionObject = require("./runExpressionObject")
const handleSET = require("./handleSET")
const ThrowError = require("../errors/ThrowError")
const evaluateExpr = require("../evaluator/evaluateExpr")
const handleASSN = require("./handleASSN")
const handleRET = require("./handleRET")
const NEXT_INSTRUCTION = require('../helpers/NEXT_INSTRUCTION')

// Runs the instructions one by one
async function instructionRunner(passedInfo, instructionList, instantReturn = false, global = false) {
    // To manage variable scoping
    const keepTracked = Object.keys(passedInfo.CONTEXT.variables)
    // const preserve = {}
    if (global) {
        passedInfo.CONTEXT.update("globals", keepTracked)
    }

    for (let i = 0; i < instructionList.length; i++) {
        const instruction = instructionList[i]

        // Key expression object
        if (instruction instanceof Object && !Array.isArray(instruction)) {
            await runExpressionObject(passedInfo.CONTEXT, instruction, passedInfo.HELD, passedInfo.DEF, passedInfo.ROBOT)
            continue
        }

        const func = instruction[0]

        // End
        if (instruction === "@end") {
            return passedInfo.SYMBOLS.END
        }

        // Next
        if (instruction === "@next") {
            return passedInfo.SYMBOLS.NEXT
        }

        // Otherwise, handle imported function call
        let result

        // Handle conditional
        if (Array.isArray(func)) {
            for (let x = 0; x < func.length; x++) {
                if (func[x] !== "@else") {
                    // Simple expression
                    if (typeof instruction[1][x] === "string" && !evaluateExpr(passedInfo.CONTEXT, instruction[1][x], true)) {
                        continue
                    }

                    // Call to JS or Simkey function
                    else if (typeof instruction[1][x] === "object" && !(await instructionRunner(passedInfo, [instruction[1][x]], true))) {
                        continue
                    }
                }

                // Run block and clean up variables
                result = await instructionRunner(passedInfo, instruction[2][x])
                cleanUp(passedInfo.CONTEXT.variables, keepTracked)
                break
            }
        }

        // Special case, SET function, used only for parameters
        else if (func === "SET") {
            addTracked(instruction[1], keepTracked)
            handleSET(passedInfo.CONTEXT, instruction)
        }

        // Assignment statement
        else if (func === "ASSN" || func === "ASSNC") {
            if (instruction[3] instanceof NEXT_INSTRUCTION) continue
            addTracked(instruction[1], keepTracked)
            handleASSN(passedInfo.CONTEXT, instruction, undefined, func.at(-1) === "C")
        }

        // Return statement
        else if (func === "RET") {
            if (instruction[1] instanceof NEXT_INSTRUCTION) continue
            return [passedInfo.SYMBOLS.RETURN, handleRET(passedInfo.CONTEXT, instruction)]
        }

        // Simkey function call
        else if (passedInfo.CONTEXT.funcs[func]) {
            try {
                const setters = setFuncCallParams(passedInfo.CONTEXT, instruction[0], instruction[1])
                setters.forEach(val => {
                    const value = val[3](passedInfo.CONTEXT)
                    val[3] = () => value
                })

                const preserveNonGlobal = nonGlobals(passedInfo.CONTEXT.globals, passedInfo.CONTEXT.variables, passedInfo.CONTEXT.constants)

                removeNonGlobals(passedInfo.CONTEXT.globals, passedInfo.CONTEXT.variables, passedInfo.CONTEXT.constants)
                const forgottenFromParams = prepareForParams(passedInfo.CONTEXT.funcs[func][1], passedInfo.CONTEXT.variables, passedInfo.CONTEXT.constants)

                result = await instructionRunner(passedInfo,
                    [...setters, ...passedInfo.CONTEXT.funcs[func][0]])
                result = Array.isArray(result) ? result[1] : result

                removeNonGlobals(passedInfo.CONTEXT.globals, passedInfo.CONTEXT.variables, passedInfo.CONTEXT.constants)

                addBackIn(preserveNonGlobal, passedInfo.CONTEXT.variables, passedInfo.CONTEXT.constants)
                addBackIn(forgottenFromParams, passedInfo.CONTEXT.variables, passedInfo.CONTEXT.constants)
            }

            // Check if the stack exceeded
            catch (err) {
                if (err instanceof RangeError) {
                    ThrowError(5600, { AT: func })
                }
                else {
                    throw err
                }
            }
        }

        // Must be but is not JS function
        else if (!passedInfo.CONTEXT.model.IMPORTS[func]) {
            ThrowError(5210, { AT: func })
        }

        // Doesnt contain parameters where it should
        else if (!Array.isArray(instruction[1].args)) {
            ThrowError(5205, { AT: func })
        }

        // Imported JS function
        else {
            // Add to this as to not mutate original
            const newInstructions = []

            // Call each of the binded functions
            for (let ind = 0; ind < instruction[1].args.length; ind++) {
                // Value func, append value from function to newInstructions
                if (typeof instruction[1].args[ind] === "function") {
                    newInstructions[ind] = instruction[1].args[ind](passedInfo.CONTEXT)
                }
                // Push since it is not a function
                else {
                    newInstructions.push(instruction[1].args[ind])
                }

                // Cannot be undefined
                if (newInstructions[ind] === undefined) {
                    ThrowError(2115, { AT: func })
                }
            }

            // Get result with arguments
            if (passedInfo.CONTEXT.model.IMPORTS[func].BLOCK) {
                result = await passedInfo.CONTEXT.model.IMPORTS[func.substring(1)](passedInfo, instruction[1].block, ...(newInstructions.length > 0 ? newInstructions : []))
            }
            else {
                result = await passedInfo.CONTEXT.model.IMPORTS[func.substring(1)](passedInfo, ...newInstructions)
            }

            cleanUp(passedInfo.CONTEXT.variables, keepTracked)
        }

        // Caller wanted instant result
        if (instantReturn) {
            return result
        }

        // Return further up
        if (passedInfo.YIELD.RETURN(result)) {
            return result
        }

        // RET next
        if (i > 0 && instructionList[i - 1][0] === "RET" && instructionList[i - 1][1] instanceof NEXT_INSTRUCTION) {
            if (result === undefined) ThrowError(2800, { AT: instruction[0] })
            return [passedInfo.SYMBOLS.RETURN, result]
        }

        // ASSN next
        if (i > 0 && instructionList[i - 1][3] instanceof NEXT_INSTRUCTION && instructionList[i - 1][0] === "ASSN") {
            // Assignment statement (could be const)
            if (result === undefined) ThrowError(2715, { AT: instruction[0] })
            addTracked(instructionList[i - 1][1], keepTracked)
            handleASSN(passedInfo.CONTEXT, instructionList[i - 1], result, instructionList[i - 1][0].at(-1) === "C")
        }

        // No result, continue
        else if (result === undefined) {
            continue
        }

        // End now or move to next
        else if (passedInfo.YIELD.END(result) || passedInfo.YIELD.NEXT(result)) {
            return result
        }
    }
}


// Adds variable to tracked after checking if it is already there and getting the "root" name
function addTracked(variableFull, tracked) {
    const variableName = variableFull.indexOf(":") > -1 ? variableFull.slice(0, variableFull.indexOf(":")) : variableFull
    tracked.includes(variableName) ? 0 : tracked.push(variableName)
}

// Sets up variables and constants under context to prepare for Simkey call
// function prepareForParams(vars, values, constants, tracked, preserved) {
//     for (const variable of vars) {
//         if (tracked.includes(variable) && preserved[variable] === undefined) {
//             const isConst = constants.includes(variable)
//             preserved[variable] = [values[variable], isConst]

//             if (isConst) {
//                 constants.splice(constants.indexOf(variable), 1)
//             }
//         }
//     }
// }

function nonGlobals(globals, variables, constants) {
    const result = {}
    for (const varName in variables) {
        if (globals.includes(varName)) continue
        result[varName] = [variables[varName], constants.includes(varName)]
    }
    return result
}


// Sets up variables and constants under context to prepare for Simkey call
function prepareForParams(params, variables, constants) {
    const result = {}
    for (const param of params) {
        if (variables[param] === undefined) continue
        result[param] = [variables[param], constants.includes(param)]
        delete variables[param]
        if (constants.includes(param)) constants.splice(constants.indexOf(param), 1)
    }
    return result
}


// Removes all non globals from variables and constants
function removeNonGlobals(globals, variables, constants) {
    for (const varName in variables) {
        if (globals.includes(varName)) continue
        delete variables[varName]
        if (constants.includes(varName)) {
            constants.splice(constants.indexOf(varName), 1)
        }
    }
}


// Adds variables back and considers whether they are constant
function addBackIn(toAdd, variables, constants) {
    for (const varName in toAdd) {
        const [value, isConst] = toAdd[varName]
        variables[varName] = value
        if (isConst && !constants.includes(varName)) constants.push(varName)
    }
}


// Removes the variables that are now out of scope
function cleanUp(variables, tracked, /*constants, preserve = {}*/) {
    for (const key in variables) {
        if (!tracked.includes(key)) {
            delete variables[key]
        }
    }

    // for (const key in preserve) {
    //     variables[key] = preserve[key][0]
    //     if (preserve[key][1]) {
    //         constants.push(key)
    //     }
    // }
}


module.exports = instructionRunner