const ThrowError = require("../errors/ThrowError")

// Check whether imported function returned a valid value
module.exports = (returnedCode, name) => {
    // No code functions
    if (returnedCode === undefined) {
        return true
    }

    const instructions = String(returnedCode).split("\n").filter((whatever) => whatever.length > 0)

    // Check validity of instructions
    for (let i = 0; i < instructions.length; i++) {
        const instruction = instructions[i]
        const starts = instruction.charAt(0)

        if (starts !== "c" && starts !== "w" && starts !== "p" && starts !== "r" && starts !== "s") {
            ThrowError(4010, { AT: name, INSTRUCTION: instruction })
        }
    }
}