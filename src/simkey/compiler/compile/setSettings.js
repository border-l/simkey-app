const getVariables = require("../types/getVariables")
const ThrowError = require("../errors/ThrowError")

// Set settings to be used when compiling script
module.exports = (context, object) => {
    const keys = Object.keys(object)
    let mode = "$"

    for (const key of keys) {
        // Non-existent key
        if (!context.model.MODES.includes(key) && !context.model.SWITCHES.includes(key)) {
            ThrowError(5000, { AT: key })
        }

        // On and exists
        if (context.model.MODES.includes(key) && object[key] === true) {
            // Several modes on
            if (mode !== "$") {
                ThrowError(5005, { AT: key + ", " + mode })
            }

            mode = key
        }

        // No boolean value
        if (object[key] !== false && object[key] !== true) {
            ThrowError(5010, { AT: key })
        }
    }

    // Mode never got set
    if (mode === "$") {
        object["$DEFAULT"] = true
    }

    // Set all other variables to false
    for (const variable of getVariables(context, false)) {
        object[variable] = !object[variable] ? false : object[variable]
    }

    context.update("settings", object)
}