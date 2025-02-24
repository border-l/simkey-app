const findBracket = require("./findBracket")

// Finds closing bracket in a string (specifically "]")
module.exports = (context, string) => {
    return findBracket(context, 0, string.split(""))
}