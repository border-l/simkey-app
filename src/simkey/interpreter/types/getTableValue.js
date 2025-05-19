const ThrowError = require("../errors/ThrowError")

// Gets value from table (could be whole table or subtable)
function getTableValue(context, table, noError = false, errorIndex = false) {
    // Get colon's index and the table
    const colonIndex = table.indexOf(":")
    const tableValue = context.variables[table.substring(0, colonIndex > -1 ? colonIndex : table.length)]

    if (!(tableValue instanceof Object)) {
        // table does not exist, error
        if (!noError) ThrowError(3030, { AT: table })

        // Table does not exist, no error
        return
    }

    // Not specific subtable, return whole
    if (colonIndex === -1) {
        return tableValue
    }

    // List the keys
    const keys = table.slice(colonIndex + 1).split(":")
    let result = tableValue

    // Go through keys (since this can be many dimensional)
    for (const key of keys) {
        result = result[key]
        if (result === undefined) {
            if (!noError) ThrowError(3300, { AT: table, KEY: key })
            else return
        }
    }

    return result
}

module.exports = getTableValue