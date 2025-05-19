// Creates a new table format ("type")
function table(INFO, BLOCK, name) {
    name = name.trim()

    if (name.replace(/(\w+)/g, "").length !== 0 || name.indexOf(" ") > -1 || name === "") {
        throw new Error("Invalid name for table. Cannot be empty, or contain colons or spaces. AT: " + name)
    }

    const subtables = BLOCK.join(" ").split(",").map(x => x.trim()).filter(x => x !== "")
    for (const subtable of subtables) {
        if (subtable.replace(/(\w+)/g, "").length !== 0 || subtable.indexOf(" ") > -1 || subtable === "") {
            throw new Error("Invalid name for subtable. Cannot be empty, or contain colons or spaces. AT: " + name)
        }
    }

    INFO.CONTEXT.tables[name] = subtables
}

module.exports = { FUNCTION: table, TAKES: { PARAMS: "[LOOSE]", BLOCK: true, DONT_PARSE_BLOCK: true }}