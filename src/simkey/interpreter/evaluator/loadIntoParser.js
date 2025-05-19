const fs = require('fs')
const path = require('path')

// Loads all the functions from functions dir into parser
function loadIntoParser(parser) {
    const files = fs.readdirSync(path.join(__dirname, "./functions"))

    files.forEach(file => {
        const functionName = path.basename(file, ".js")
        parser.functions[functionName] = require(path.join(__dirname, "./functions", functionName))
    })
}

module.exports = loadIntoParser