const ERROR = require('path').basename(__filename).slice(0,-4)
const CODE = require("../Codes")[ERROR]

const FORMAT = {
    NonExistentFlag: ({ AT }) => `Referenced flag does not exist in MACRO section. AT: ${AT}`,
    NonExistentVariable: ({ AT }) => `Referenced a non-existent variable. AT: ${AT}`,
    NonExistentVector: ({ AT }) => `Referenced a non-existent VECTOR. AT: ${AT}`,
    NonExistentBool: ({ AT }) => `Referenced a non-existent boolean. AT: ${AT}`,
    NonExistentFunc: ({ AT }) => `Referenced function does not exist. AT: ${AT}`,
    NonExistentState: ({ AT }) => ``, // ?
    NonExistentTable: ({ AT }) => `Referenced a non-existent TABLE. AT: ${AT}`,
    NonExistentString: ({ AT }) => `Referenced a non-existent STRING. AT: ${AT}`,
    
    IncompleteFlag: ({ AT }) => `Flag reference is not complete. AT: ${AT}`,

    IndexOutOfRange: ({ AT }) => `Index is out of range, at: ${AT}`,

    InvalidKey: ({ AT, KEY }) => `Invalid key given when trying to access subtable. AT: ${AT}, KEY: ${KEY}`
}

module.exports = { ERROR, CODE, FORMAT }