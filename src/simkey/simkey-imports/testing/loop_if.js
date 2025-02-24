// Types out the string repeatedly (num times) if bool is true
function loop_if(INFO, string, num, bool) {
    // No loop if false
    if (!bool) return ""

    let code = ""

    // Loop num times
    for (let x = 0; x < num; x++) {
        // Go through each char
        for (let i = 0; i < string.length; i++) {
            let key = string[i]

            // Deal with space case
            key = (key === " ") ? "SPACE" : key

            // Wait, press and release key
            code += `\nw10\np${key}\nr${key}`
        }
    }

    // Another 10 ms
    code += "\nw10"

    return code
}

module.exports = { FUNCTION: loop_if, TAKES: { PARAMS: "[STR,NUM,BOOL]", BLOCK: false } }