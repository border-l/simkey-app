// Sets a subtable, regardless of whether the subtable exists or not
function set(INFO, table, key, value) {
    if (isNaN(key) && (key === "" || key.replace(/(\w+)/g, "").length !== 0 || key.indexOf(" ") > -1)) {
        throw new Error("Invalid name for subtable. Cannot contain colons or spaces. AT: " + key)
    }

    table[key] = value
}

module.exports = { FUNCTION: set, TAKES: { PARAMS: "[TABLE, STR | NUM, VECTOR | NUM | STR | TABLE | BOOL]" }}