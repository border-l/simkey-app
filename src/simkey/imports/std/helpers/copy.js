const deepClone = require("../../../interpreter/helpers/deepClone")

// Deep copies an object
function copy(INFO, obj) {
    return deepClone(obj)
}

module.exports = { FUNCTION: copy, TAKES: { PARAMS: "[TABLE | VECTOR]" }}