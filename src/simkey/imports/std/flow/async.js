const deepClone = require("../../../interpreter/helpers/deepClone")

// Calls interpret on instructions without awaiting, making it async
function asyncFunc(INFO, BLOCK) {
    new_variables = deepClone(INFO.CONTEXT.variables)
    new_constants = deepClone(INFO.CONTEXT.constants)
    INFO = {...INFO, CONTEXT: {...INFO.CONTEXT, variables: new_variables, constants: new_constants}}

    INFO.RUN(INFO, BLOCK)
        .catch(err => INFO.ERROR[0] = err.message)
}

module.exports = { FUNCTION: asyncFunc, TAKES: { PARAMS: "", BLOCK: true } }