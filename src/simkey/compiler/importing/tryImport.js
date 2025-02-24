const autoImport = require("./autoImport")
const getParameters = require("./getParameters")
const ThrowError = require("../errors/ThrowError")

const path = require("path")
const fs = require("fs")
const exists = fs.existsSync

// Try to import next function in array, returns new index
module.exports = (context, array, currentPath = path.dirname(path.resolve(context.fileName))) => {
    // account for parseImports giving an empty array (not sure why it happens)
    if (array.length == 0) return 0

    let name
    let params
    let importLocation 
    let first = array[0]
    let returnIndex = -1

    // Make sure first is valid
    if (first !== "CALL.BEFORE" && !first.startsWith("@")) {
        ThrowError(4005, { AT: first })
    }

    // Gather information about name & import location
    if (first === "CALL.BEFORE") {
        importLocation = array[1]
        name = "CALL.BEFORE"
        returnIndex = 1
    }
    else if (first.endsWith("*")) {
        importLocation = `${first.slice(0, -1)}.autoimport`
    }
    else if (array.length === 1 || array[1].startsWith("@") || array[1] === "CALL.BEFORE" || array[1].endsWith("*")) {
        importLocation = first.substring(1)
        name = first.substring(first.lastIndexOf("/") + 1)
        name = (!name.startsWith("@") ? "@" : "") + name
    }
    else {
        importLocation = array[1]
        name = array[0]
    }

    // Format import location to be an actual JS file location
    if (importLocation.startsWith(".")) {
        importLocation = path.join(currentPath, importLocation)
    }
    else if (!path.isAbsolute(importLocation)) {
        importLocation = path.join(__dirname.slice(0, -18), 'simkey-imports', importLocation)
    }
    else {
        importLocation = path.resolve(currentPath, importLocation)
    }

    // Check whether .autoimport or .js
    if (!importLocation.endsWith(".autoimport")) {
        importLocation += ".js"
    }

    // Check existence
    if (!exists(importLocation)) {
        ThrowError(4300, { AT: importLocation })
    }

    // .autoimport handling
    if (importLocation.endsWith(".autoimport")) {
        autoImport(context, importLocation)
        return 1
    }

    // Load imported functions into model
    if (first === "CALL.BEFORE") {
        params = require(importLocation)
    }
    else {
        // Parameters are now given by the function files themselves
        const { FUNCTION, TAKES } = require(importLocation)

        if (typeof FUNCTION !== "function") {
            ThrowError(4020, { AT: name })
        }

        context.model.IMPORTS[name.substring(1)] = FUNCTION

        if (typeof TAKES !== "object" || TAKES.PARAMS === undefined) {
            ThrowError(4025, { AT: name })
        }

        const { PARAMS, BLOCK = false, DONT_PARSE_BLOCK = false } = TAKES

        params = { PARAMS: getParameters(context, PARAMS), BLOCK, DONT_PARSE_BLOCK }
    }

    // Load params into model and return incremented
    context.model.IMPORTS[name] = params
    return returnIndex > -1 ? returnIndex : 1 // Keep an eye on this
}