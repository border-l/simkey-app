const getArray = require("../types/getArray")
const parseSection = require("./parseSection")
const getString = require("../types/getString")
const ThrowError = require("../errors/ThrowError")
const checkVariableName = require("../helpers/checkVariableName")

// Handles settings section
module.exports = (context) => {
    parseSection(context, (tokens, token, i, section, next) => {
        // Check for assignment operator
        if (tokens[i + 1] !== "=") {
            ThrowError(1100, { SECTION: "SETTINGS", AT: token })
        }

        // First input for token
        const firstIn = tokens[i + 2]

        if (token === "repeat") {
            // Number repeat
            if (Number(firstIn)) {
                context.model.SETTINGS.repeat = Number(firstIn)
            }
            // Literal repeat (boolean)
            else if (firstIn === "OFF" || firstIn === "ON") {
                context.model.SETTINGS.repeat = firstIn
            }
            // Not a valid value
            else {
                ThrowError(2000, { AT: firstIn })
            }

            // Move along index
            return i + 2
        }

        else if (token === "name") {
            // Deal with string and move along, error if no starting "
            if (!firstIn.startsWith("\"")) {
                ThrowError(2005, { AT: firstIn })
            }

            // Get string for the name
            const [value, newIndex] = getString(context, i + 2)

            // Update settings in model
            context.model.SETTINGS.name = value

            // Move along to end of the string
            return newIndex
        }

        else if (token === "mode") {
            // Set value if valid variable name, otherwise error
            if (!checkVariableName(firstIn)) {
                ThrowError(2010, { AT: firstIn })
            }
            // Update settings in model
            context.model.SETTINGS.mode = firstIn

            // Move index along
            return i + 2
        }

        else if (token === "switches") {
            // Parse array if opening bracket is present in correct spot, otherwise error
            if (!firstIn.startsWith("[")) {
                ThrowError(1010, { AT: firstIn })
            }

            // Get array and check valid elements
            const [value, newIndex] = getArray(context, i + 2)

            // Check if each variable is validly named
            value.forEach((val) => 
                !checkVariableName(val) ? ThrowError(2015, { AT: val }) : 0)

            // Update settings in model
            context.model.SETTINGS.switches = value

            // Index after array
            return newIndex
        }

        // Handle shortcut assignment
        else if (token === "shortcut") {
            context.model.SETTINGS.shortcut = firstIn
            return i + 2
        }

        // Invalid attribute named in assignment
        else {
            ThrowError(2020, { AT: token })
        }
    }, (section) => section === "SETTINGS")
}