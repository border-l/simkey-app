const Generate = require("./GenerateObjects")

// Template for making errors from defined FORMATs
function ErrorTemplate({ ERROR, CODE, FORMAT }) {
    // Get both ways
    const ErrorToCode = Generate.GetErrorToCode(FORMAT, CODE)
    const CodeToError = Generate.InvertErrorToCode(ErrorToCode)

    // Make the functions and add more to export object
    const exportObject = Generate.CreateErrorFunctions(FORMAT, ERROR, ErrorToCode)
    Object.assign(exportObject, {
        ErrorToCode,
        CodeToError,
        TypeName: ERROR,
        TypeCode: CODE
    })

    // Done
    return exportObject
}

module.exports = ErrorTemplate