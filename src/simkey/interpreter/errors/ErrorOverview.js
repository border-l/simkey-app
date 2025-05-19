const fs = require("fs")
const path = require("path")

// Generates error functions (and more) given FORMAT
const ErrorTemplate = require("./ErrorTemplate")

// Structure for the object that gets returned
const Errors = {Types: {names: [], codes: [], fromCode: {}, fromName: {}}, Codes: {}, Errors: {}}

// Relevant files in ERRORS dir
const files = fs.readdirSync(path.join(__dirname, "./ERRORS"))

// Go through files and get error functions
for (const file of files) {
    const ModuleObject = ErrorTemplate(require(`./ERRORS/${file}`))

    // Push to name and code
    Errors.Types.names.push(ModuleObject.TypeName)
    Errors.Types.codes.push(ModuleObject.TypeCode)

    // Put name and code in the proper spot
    Errors.Types.fromCode[ModuleObject.TypeCode] = ModuleObject.TypeName
    Errors.Types.fromName[ModuleObject.TypeName] = ModuleObject.TypeCode

    // Put it into proper sub-object
    Object.assign(Errors.Codes, ModuleObject.CodeToError)
    Object.assign(Errors.Errors, ModuleObject.ErrorToCode)

    // Ignore everything that is not an error function
    delete ModuleObject.ErrorToCode
    delete ModuleObject.CodeToError
    delete ModuleObject.TypeCode
    delete ModuleObject.TypeName

    Object.assign(Errors, ModuleObject)
}

module.exports = Errors