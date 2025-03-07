const checkVariableName = require("../helpers/checkVariableName")
const combineTillNext = require("../helpers/combineTillNext")
const checkSection = require("../helpers/checkSection")
const parseInnards = require("./parseInnards")
const parseFuncParams = require("./parseFuncParams")
const getArray = require("../types/getArray")
const ThrowError = require("../errors/ThrowError")

// Organizes tokens into model w/ exception of some sections
module.exports = (context) => {
    const tokens = context.tokens
    let section = "MACRO"
    let passedMacroDeclaration = false

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]

        // Check if this token is updating sections
        if (checkSection(context, token)) {
            // Error if there's more than one macro section
            if (passedMacroDeclaration || context.model.MACRO.length > 0) {
                ThrowError(1300, {})
            }
            // Update section
            section = token.substring(1, token.length - 1)
            section === "MACRO" ? passedMacroDeclaration = true : 0
        }

        // Skipped as other functions handle them later on
        else if (section === "IMPORTS" || section === "SETTINGS" || section === "MODES" || section === "SWITCHES" || section === "VECTORS") {
            continue
        }
        
        // Handle function section
        else if (section === "FUNCS") {
            // Conditionals to handle different errors
            if (token.charAt(0) !== "@") {
                ThrowError(1030, { AT: token })
            }
            if (token.length < 2) {
                ThrowError(1105, { AT: token })
            }
            if (context.builtIn.includes(token)) {
                ThrowError(1105, { AT: token })
            }
            if (i === tokens.length - 1) {
                ThrowError(1035, { AT: token })
            }

            // Block exists with no params, parse function body
            if (context.tokens[i + 1] === "{") {
                const [model, newIndex] = parseInnards(context, i + 1, "FUNCS")
                context.model.FUNCS[token] = [model, []]
                i = newIndex
                continue
            }

            // No parameters, no block, invalid structure
            if (!context.tokens[i + 1].startsWith("[")) {
                ThrowError(1035, { AT: token })
            }

            // Get parameters
            const [params, arrayIndex] = getArray(context, i + 1)
            
            // Block doesnt exist
            if (context.tokens[arrayIndex + 1] !== '{') {
                ThrowError(1035, { AT: token })
            }

            // Parse the params
            const parsedParams = parseFuncParams(context, params)

            // Parse function body
            const [model, newIndex] = parseInnards(context, arrayIndex + 1, "FUNCS")
            context.model.FUNCS[token] = [model, parsedParams]

            // Move index along, continue
            i = newIndex
            continue
        }

        // Handle macro section
        else if (section === "MACRO") {
            const [model, newIndex] = parseInnards(context, i - 1, "MACRO")
            context.model.MACRO = model
            i = newIndex - 1
        }

        // Section is not valid
        else {
            ThrowError(1305, { AT: token })
        }
    }
}