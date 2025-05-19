const deepClone = require("../../../interpreter/helpers/deepClone")

// Calls interpret on instructions without waiting, making it async
function asyncFunc(INFO, BLOCK) {
    new_variables = deepClone(INFO.CONTEXT.variables)
    new_constants = deepClone(INFO.CONTEXT.constants)
    INFO = {...INFO, CONTEXT: {...INFO.CONTEXT, variables: new_variables, constants: new_constants}}
    INFO.RUN(INFO, BLOCK)
}

module.exports = { FUNCTION: asyncFunc, TAKES: { PARAMS: "", BLOCK: true } }