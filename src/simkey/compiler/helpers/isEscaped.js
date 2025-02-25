// Checks if character is escaped
module.exports = (string, index) => {
    let amount = 0

    for (let i = index - 1; i >= 0; i--) {
        // Move on if not escape
        if (string.charAt(i) !== "\\") {
            break
        }

        // Account for next escaped
        amount++
    }

    // Even means not escaped
    return amount % 2 !== 0
}