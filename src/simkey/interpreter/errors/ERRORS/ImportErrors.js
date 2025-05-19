const ERROR = require('path').basename(__filename).slice(0,-4)
const CODE = require("../Codes")[ERROR]

const FORMAT = {
    InvalidParameterType: ({ AT }) => `Invalid type in parameters for imported function. AT: ${AT}`,
    InvalidImportToken: ({ AT }) => `Invalid token in import statement. AT: ${AT}`,
    InvalidCodeReturned: ({ AT }) => `Invalid KeyC instruction given from imported function. AT: ${AT}, INSTRUCTION: ${INSTRUCTION}`,
    InvalidBooleanReturned: ({ AT, VALUE }) => `Boolean function given in condition did not return true or false. AT: ${AT}, VALUE: ${VALUE}`, // Functions made for conditionals
    InvalidFunctionExported: ({ AT }) => `No function was exported from file in import statement, expected function. AT: ${AT}`,
    InvalidTakesObject: ({ AT }) => `Imported function does not have a valid \`TAKES\` object (which specifies parameters and whether blocks are taken). AT: ${AT}`,

    DuplicateTypesWithUnion: ({ AT }) => `Duplicate of type in union type in parameters for imported function. AT: ${AT}`,

    LooseMustBeLast: ({ AT }) => `LOOSE type does not come last in parameters for imported function. AT: ${AT}`,

    ImportedFileNotExist: ({ AT }) => `Imported function's JS or Simkey file does not exist. AT: ${AT}`,
    ImportedLabelNotExist: ({ AT }) => `Simkey export label does not exist in its file. AT: ${AT}`,
    ImportedFuncTakesConstant: ({ MODE, FUNC }) => `Imported Simkey function has a constant as a parameter. CONSTANT: ${MODE}, FUNC: ${FUNC}`,

    ExportingNonExistentFunc: ({ AT }) => `Simkey export includes non-existent function. AT: ${AT}`
}

module.exports = { ERROR, CODE, FORMAT }