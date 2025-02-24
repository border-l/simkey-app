const setFuncCallParams = require("./setFuncCallParams")
const ThrowError = require("../errors/ThrowError")

// Gets instruction list for final compilation
function getInstructionList(cont, instructions, context) {
    const finalInstructions = []
    
    for (let i = 0; i < instructions.length; i++) {
        const instruction = instructions[i]
        
        // Handle arrays
        if (Array.isArray(instruction)) {
            const func = instruction[0]

            // Handle conditional instruction
            if (Array.isArray(func)) {
                finalInstructions.push(instruction)
                continue
            }

            // Handle goto
            if (func === "@goto") {
                // Add instructions in macro after flag
                finalInstructions.push(...getInstructionList(cont, cont.model.MACRO.slice(cont.model.MACRO.indexOf(instruction[1]) + 1), "MACRO"))

                // End if last instruction is end
                if (finalInstructions[finalInstructions.length - 1] === "@end") {
                    break
                }

                continue
            }

            if (cont.model.FUNCS[func]) {
                finalInstructions.push(...setFuncCallParams(cont, func, instruction[1]), ...getInstructionList(cont, cont.model.FUNCS[func][0], func))
    
                // End if last instruction is end
                if (finalInstructions[finalInstructions.length - 1] === "@end") {
                    break
                }
    
                continue
            }

            // Nothing above matches, add as-is
            finalInstructions.push(instruction)
            continue
        }

        // Key expression instruction
        if (instruction instanceof Object) {
            finalInstructions.push(instruction)
            continue
        }

        // Invalid instruction
        if (!instruction.startsWith("@")) {
            ThrowError(5200, { AT: instruction, CONTEXT: context })
        }

        // Direct function instruction (@end, import, or user defined)

        if (instruction === "@end") {
            finalInstructions.push("@end")
            break
        }

        // Imported function
        if (cont.model.IMPORTS[instruction]) {
            finalInstructions.push(instruction)
            continue
        }

        // Nothing worked (This should never happen)
        throw new Error("Referenced function does not exist, but it arrived at #getInstructionList, getting past checks: " + instruction)
    }

    return finalInstructions
}

module.exports = getInstructionList