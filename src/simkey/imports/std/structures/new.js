const looseReader = require("../../../interpreter/helpers/looseReader")

// Creates a new table (instance)
function newTable(INFO, args) {
    nameArg = args.indexOf(",") > -1 ? args.slice(0, args.indexOf(",")).trim() : args.trim()
    const tableDef = INFO.CONTEXT.tables[nameArg]

    if (tableDef === undefined) {
        throw new Error("Attempted to create a table of a non-existent type. AT: " + nameArg)
    }

    // Have table layout, with everything null by default
    const baseTable = {}
    for (const subtable of tableDef) {
        baseTable[subtable] = 0
    }

    // Nothing to set
    if (args.indexOf(",") === -1) {
        return baseTable
    }

    // Get unknown number of arguments
    const restArgs = looseReader(INFO.CONTEXT, args.slice(args.indexOf(",") + 1), ["VECTOR", "STR", "NUM", "BOOL", "TABLE"])

    // Too many arguments
    if (restArgs.length > tableDef.length) {
        throw new Error("Gave more arguments to @new than there are subtables in table definition. AT: " + nameArg)
    }

    // Set in order
    for (let i = 0; i < restArgs.length; i++) {
        baseTable[tableDef[i]] = restArgs[i]
    }

    return baseTable
}

module.exports = { FUNCTION: newTable, TAKES: { PARAMS: "[LOOSE]" } }