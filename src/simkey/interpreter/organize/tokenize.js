const specials = ["for", "loop", "repeat", "if", "elseif", "else", "return", "next", "with", "async"]

// Splits the script into tokens
function tokenize(context) {
    const regex = /([ \t\n\r])/g
    const split = context.script.split(regex).filter(token => token.length > 0 && token !== '' && token !== ' ' && token !== "\n" && token !== '\t' && token !== '\r')
    const final = []

    const brackets = []

    // Each "token", currently redundant
    for (let i = 0; i < split.length; i++) {
        const token = split[i]
        let collect = ""

        // Each character
        for (let x = 0; x < token.length; x++) {
            const char = token[x]
            const last = brackets.length > 0 ? brackets.at(-1) : -1

            // Escape
            if (last === "\\") {
                collect += char
                brackets.pop()
                continue
            }

            // In string currently
            else if (last === '"') {
                // Out of string
                if (char === '"') {
                    collect += '"'
                    brackets.pop()
                }

                // Escape
                else if (char === "\\") {
                    collect += "\\"
                    brackets.push("\\")
                }

                // Bracket (in string, escape because parser is stupid)
                else if (char === "]" && x === token.length - 1) {
                    collect += "\\" + "]"
                }

                // Random character
                else {
                    collect += char
                }

                continue
            }

            // Starting array
            else if (char === "[" && x === 0) {
                collect += "["
                brackets.push("[")
                continue
            }

            // Ending array
            else if (char === "]" && x === token.length - 1 && last === "[") {
                collect += "]"
                brackets.pop()
                continue
            }

            // Start of string
            else if (char === '"' && (x === 0 && brackets.length === 0 || last === "[")) {
                collect += '"'
                brackets.push('"')
                continue
            }

            collect += char
        }

        // Escape end in string
        if (token === "end" && brackets.at(-1) === '"') {
            final.push("\\" + collect)
        }

        // Add @ to special functions
        else if (brackets.at(-1) !== '"' && specials.includes(token)) {
            final.push("@" + token)
        }

        // Not sure?
        else if (collect.length > 0) {
            final.push(collect)
        }
    }

    context.update('tokens', final)
}

module.exports = tokenize