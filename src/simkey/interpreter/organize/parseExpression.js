const isEscaped = require("../helpers/isEscaped")
const findStringBracket = require("../helpers/findStringBracket")
const getVariable = require("../types/getVariable")
const evaluateExpr = require("../evaluator/evaluateExpr")
const checkVariableName = require("../helpers/checkVariableName")
const checkValidExpr = require("../helpers/checkValidExpr")
const ThrowError = require("../errors/ThrowError")

// Parses expressions for sequences (split it up)
module.exports = (context, expression) => {
    // Format of parsed expressions
    const parsedExpression = {
        hold: "DEF",
        wait: "DEF",
        keysPressed: [],
        keysHeld: []
    }

    // Set to expression by default, will be sliced
    let keyExpression = expression

    const endBracket = expression.indexOf(">")

    // Expression has a specific hold value set
    if (expression.startsWith("<") && expression.indexOf(">") > -1 && !isEscaped(expression, endBracket + 1)) {
        // Isolate value and shift keyExpression
        const value = expression.substring(1, endBracket)
        keyExpression = expression.substring(endBracket + 1)

        // A literal number for hold
        if (!isNaN(Number(value)) && Number(value) >= 0) {
            parsedExpression.hold = Number(value)
        }

        // Handle non-literals
        else {
            // An expression
            if (checkValidExpr(value)) {
                parsedExpression.hold = (context) => evaluateExpr(context, value)
            }

            // Valid name for it
            else if (!checkVariableName(value, true)) {
                ThrowError(1100, { AT: value })
            }

            else {
                // Let getVariable "NUM" handle it
                parsedExpression.hold = (context) => getVariable(context, value, ["NUM"])
            }
        }
    }

    // Get start bracket for wait
    const startBracket = keyExpression.lastIndexOf("<")

    // Expression has a specific wait value set
    if (keyExpression.endsWith(">") && startBracket > 0 && !isEscaped(keyExpression, startBracket) && !isEscaped(keyExpression, keyExpression.length - 1)) {
        // Isolate value and shift keyExpression
        const value = keyExpression.slice(startBracket + 1, -1)
        keyExpression = keyExpression.substring(0, startBracket)

        // A literal number for hold
        if (!isNaN(Number(value)) && Number(value) >= 0) {
            parsedExpression.wait = Number(value)
        }

        // Handle non-literals
        else {
            // An expression
            if (checkValidExpr(value)) {
                parsedExpression.hold = (context) => evaluateExpr(context, value)
            }

            // Valid name for it
            else if (!checkVariableName(value, true)) {
                ThrowError(1100, { AT: value })
            }

            else {
                // Let getVariable "NUM" handle it
                parsedExpression.wait = (context) => getVariable(context, value, ["NUM"])
            }
        }
    }

    // Flag for holding (for |a| vs |a)
    let held = false

    for (let i = 0; i < keyExpression.length; i++) {
        let key = keyExpression.charAt(i)

        // Held mode switch
        if (key === "|") {
            held = !held

            // Held but no inputs
            if (held && i === keyExpression.length - 1) {
                ThrowError(1220, { AT: expression })
            }

            // Held previously, has to come at the end
            if (!held && keyExpression.charAt(i + 1)) {
                ThrowError(1200, { AT: expression })
            }

            continue
        }

        // Key that requires phrase
        if (key === "{") {
            const closeBracket = findStringBracket(context, keyExpression.substring(i)) + i

            // No closing bracket
            if (closeBracket - i === -1) {
                ThrowError(1020, { AT: expression })
            }

            // Add key
            key = keyExpression.substring(i + 1, closeBracket)
            i = closeBracket
        }

        else if (key === "\\") {
            if (i >= keyExpression.length - 1) {
                ThrowError(1205, { AT: expression })
            }

            // Add next character
            i++
            key = keyExpression.charAt(i)
        }

        // Add to held
        if (held) {
            parsedExpression.keysHeld.push(key)
            continue
        }

        // Add to pressed
        parsedExpression.keysPressed.push(key)
    }

    // Check duplicates for held
    for (let i = 0; i < parsedExpression.keysHeld.length; i++) {
        const key = parsedExpression.keysHeld[i]

        // Both held and pressed
        if (parsedExpression.keysPressed.includes(key.toLowerCase()) || parsedExpression.keysPressed.includes(key.toUpperCase())) {
            ThrowError(1210, { AT: expression })
        }

        const upper = parsedExpression.keysHeld.lastIndexOf(key.toUpperCase())
        const lower = parsedExpression.keysHeld.lastIndexOf(key.toLowerCase())

        // Several in held array
        if ((lower !== i && lower > -1) || (upper !== i && upper > -1)) {
            ThrowError(1215, { AT: expression })
        }
    }

    // Check duplicates for pressed
    for (let i = 0; i < parsedExpression.keysPressed.length; i++) {
        const key = parsedExpression.keysPressed[i]

        const upper = parsedExpression.keysPressed.lastIndexOf(key.toUpperCase())
        const lower = parsedExpression.keysPressed.lastIndexOf(key.toLowerCase())

        // Several in pressed array
        if ((lower !== i && lower > -1) || (upper !== i && upper > -1)) {
            ThrowError(1215, { AT: expression })
        }
    }

    // No closing "|" is handled differently
    if (held) {
        // All held end with "|" to signify this
        for (let i = 0; i < parsedExpression.keysHeld.length; i++) {
            parsedExpression.keysHeld[i] = parsedExpression.keysHeld[i] + "|"
        }
    }

    return parsedExpression
}