const fs = require("fs")
const path = require("path")
const files = fs.readdirSync(path.join(__dirname, "./ERRORS"))
const GenerateObjects = require("./GenerateObjects")

let Base = {}

// Generate errors from each error file
for (const file of files) {
    // Get errors from current files
    const ErrorFile = require(`./ERRORS/${file}`)
    const Errors = GenerateObjects.GetErrorToCode(ErrorFile.FORMAT, ErrorFile.CODE)
    
    // Sort errors for more readability
    Base = Object.fromEntries(Object.entries({ ...Base, ...Errors }).sort(([, valueA], [, valueB]) => valueA - valueB))
}

// Write base errors
fs.writeFile("BaseErrors.json", JSON.stringify(Base, null, 4), "utf-8", (err) => err ? console.log(err): '')