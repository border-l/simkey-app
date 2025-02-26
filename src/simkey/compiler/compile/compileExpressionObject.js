const ThrowError = require("../errors/ThrowError")

// Compiles expression object to KeyC
module.exports = (expression, heldKeys, def) => {
    let code = ""

    // Get hold and wait
    let hold = expression.hold === "DEF" ? def[0] : expression.hold
    let wait = expression.wait === "DEF" ? def[1] : expression.wait

    // Account for how numbers in vectors are now stored
    if (typeof hold === "function") {
        hold = hold()
    }
    if (typeof wait === "function") {
        wait = wait()
    }

    // Check proper hold and wait values
    if (hold < 0 || wait < 0) {
        ThrowError(2500, { VALUES: hold + "," + wait })
    }
    
    // Simple wait expression
    if (expression.keysHeld.length === 0 && expression.keysPressed === 0 && expression.wait === 'DEF') { 
        return "\nw" + hold
    }

    // Held down keys for release at end
    let releaseLater = []

    // Held part of expression
    for (const key of expression.keysHeld) {
        // Held already and key ends with "|"
        if (heldKeys.includes(key.slice(0,-1)) && key.endsWith("|")) {
            releaseLater.push(key.slice(0,-1))
            continue
        }

        if (heldKeys.includes(key)) {
            code += '\nr' + key

            heldKeys.splice(heldKeys.indexOf(key), 1)
            continue
        }

        // Press key
        code += '\np' + (key.endsWith("|") ? key.slice(0, -1) : key)
        heldKeys.push(key.endsWith("|") ? key.slice(0, -1) : key)
    }

    // Press each pressed key
    for (const key of expression.keysPressed) {
        if (heldKeys.includes(key)) {
            ThrowError(1210, { AT: key })
        }

        code += "\np" + key
    }

    // Hold for period
    code += hold > 0 ? "\nw" + hold : ""

    // Release all pressed keys
    for (const key of expression.keysPressed) {
        code += "\nr" + key
    }
    
    // Release all held keys to be released
    for (const key of releaseLater) {
        heldKeys.splice(heldKeys.indexOf(key), 1)
        code += "\nr" + key
    }

    // Wait for period
    code += (wait > 0 ? "\nw" + wait : '')

    return code
}