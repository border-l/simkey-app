const ThrowError = require("../errors/ThrowError")

// Runs expression object directly
async function runExpressionObject (context, expression, heldKeys, def, { send, sleep }) {
    // Get hold and wait
    let hold = expression.hold === "DEF" ? def[0] : expression.hold
    let wait = expression.wait === "DEF" ? def[1] : expression.wait

    // Account for how numbers in vectors are now stored
    if (typeof hold === "function") {
        hold = hold(context)
    }
    if (typeof wait === "function") {
        wait = wait(context)
    }

    // Check proper hold and wait values
    if (hold < 0 || wait < 0) {
        ThrowError(2500, { VALUES: hold + "," + wait })
    }

    // Simple wait expression
    if (expression.keysHeld.length === 0 && expression.keysPressed.length === 0 && expression.wait === 'DEF') { 
        await sleep(hold)
        return
    }

    // Held down keys for release at end
    let releaseLater = []

    // Held part of expression
    for (const key of expression.keysHeld) {
        // Held already and key ends with "|"
        if (key.endsWith("|") && heldKeys.includes(key.slice(0,-1))) {
            releaseLater.push(key.slice(0,-1))
            continue
        }

        if (heldKeys.includes(key)) {
            send([key, false])
            heldKeys.splice(heldKeys.indexOf(key), 1)
            continue
        }

        // Press key
        const adj = key.endsWith("|") ? key.slice(0, -1) : key
        send([adj, true])
        heldKeys.push(adj)
    }

    // Press each pressed key
    for (const key of expression.keysPressed) {
        if (heldKeys.includes(key)) {
            ThrowError(1210, { AT: key })
        }

        send([key, true])
    }

    // Hold for period
    hold > 0 ? await sleep(hold) : 0

    // Release all pressed keys
    for (const key of expression.keysPressed) {
        send([key, false])
    }
    
    // Release all held keys to be released
    for (const key of releaseLater) {
        heldKeys.splice(heldKeys.indexOf(key), 1)
        send([key, false])
    }

    // Wait for period
    wait > 0 ? await sleep(wait) : 0
}

module.exports = runExpressionObject