const getArray = require("../types/getArray")
const parseSection = require("./parseSection")
const getString = require("../types/getString")
const ThrowError = require("../errors/ThrowError")
const checkVariableName = require("../helpers/checkVariableName")

// Handles meta section
module.exports = (context) => {
    parseSection(context, (tokens, token, i, section, next) => {
        // First input for token
        const firstIn = tokens[i + 1]

        if (firstIn === undefined) {
            ThrowError(...[])
        }

        if (token === "REPEAT") {
            // Number repeat
            if (Number(firstIn)) {
                context.model.META.REPEAT = Number(firstIn)
            }
            // Literal repeat (boolean)
            else if (firstIn === "true" || firstIn === "false") {
                context.model.META.REPEAT = firstIn === "true"
            }
            // Not a valid value
            else {
                ThrowError(2000, { AT: firstIn })
            }

            // Move along index
            return i + 1
        }

        else if (token === "TITLE") {
            // Deal with string and move along, error if no starting "
            if (!firstIn.startsWith("\"")) {
                ThrowError(2005, { AT: firstIn })
            }

            // Get string for the title
            const [value, newIndex] = getString(context, i + 1)

            // Update meta in model
            context.model.META.TITLE = value

            // Move along to end of the string
            return newIndex
        }

        // Handle shortcut assignment
        else if (token === "SHORTCUT" || token === "VERSION") {
            context.model.META[token] = firstIn
            return i + 1
        }

        // Invalid attribute named in assignment
        else {
            ThrowError(2020, { AT: token })
        }
    }, (section) => section === "META")
}