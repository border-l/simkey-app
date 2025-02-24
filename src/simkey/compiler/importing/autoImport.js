const tryImport = require("./tryImport")

const fs = require("fs")
const exists = fs.existsSync

// Handle importing from .autoimport file
module.exports = (context, pathTo) => {
    if (!exists(pathTo)) {
        return
    }

    // Load file & split into tokens
    const imports = fs.readFileSync(pathTo, 'utf-8').split(/([ \t\n\r])/g).filter(token => token.length > 0 && token !== ' ' && token !== "\n" && token !== '\t' && token !== '\r')

    for (let i = 0; i < imports.length; i++) {
        // Import current file (path (0,-12) due to .autoimport being at the end)
        i += tryImport(context, imports.slice(i), pathTo.slice(0, -12))
    }
}