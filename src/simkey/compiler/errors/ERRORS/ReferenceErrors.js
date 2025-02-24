const ERROR = require('path').basename(__filename).slice(0,-4)
const CODE = require("../Codes")[ERROR]

const FORMAT = {
    NonExistentFlag: ({ AT }) => `Referenced flag does not exist in MACRO section. AT: ${AT}`,
    NonExistentVariable: ({ AT }) => `Referenced a non-existent variable. AT: ${AT}`,
    NonExistentVector: ({ AT }) => `Referenced a non-existent VECTOR. AT: ${AT}`,
    NonExistentBool: ({ AT }) => `Referenced a non-existent boolean. AT: ${AT}`,
    NonExistentFunc: ({ AT }) => `Referenced function does not exist. AT: ${AT}`,
    NonExistentState: ({ AT }) => ``, // ?
    
    IncompleteFlag: ({ AT }) => `Flag reference is not complete. AT: ${AT}`,

    IndexOutOfRange: ({ AT }) => `Index is out of range, at: ${AT}`,
}

module.exports = { ERROR, CODE, FORMAT }