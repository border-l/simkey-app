// Types a string out (this overcomes the restriction of not being able to have repeats)
function type (INFO, string) {
    let code = ""

    // Go through each char
    for (let i = 0; i < string.length; i++) {
        let key = string[i]

        // Deal with space case
        key = (key === " ") ? "SPACE" : key

        // Wait, press and release key
        code += `\nw10\np${key}\nr${key}`
    }

    // Another 10 ms
    code += "\nw10"

    return code
}

module.exports = { FUNCTION: type, TAKES: { PARAMS: "[STR|LOOSE]", BLOCK: false } }