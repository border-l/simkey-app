const getBalancedExpression = require("./getBalancedExpression")

// Check whether name is a valid variable name
module.exports = (name, canHaveIndex = false) => {
    // (This is unnecessary) check for indexed vector
    if (canHaveIndex && name.includes(":")) {
        const ind = name.slice(name.indexOf(":") + 1)
        const before = name.slice(1, name.indexOf(":"))
        return name[0] === "$" && before.replace(/(\w+)/g, "").length === 0 && name.indexOf(" ") === -1
                && (ind.replace(/(-)?\d+/, "").length === 0 || getBalancedExpression(ind).length === ind.length || !ind.split(":").some(x => x.replace(/(\w+)/g, "").length !== 0))
    }

    // Non-indexed vector
    return name[0] === "$" && name.slice(1).replace(/(\w+)/g, "").length === 0
}