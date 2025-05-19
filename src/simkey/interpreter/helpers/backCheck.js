// Check if token is escaped
module.exports = (token) => {
    for (let i = 0; i < token.length; i++) {
        const char = token.charAt(i)

        // Go forward if escaped
        if (char === "\\") i++
        else if (i === token.length - 1) return false
    }

    // Was escaped since loop didnt catch it
    return true
}