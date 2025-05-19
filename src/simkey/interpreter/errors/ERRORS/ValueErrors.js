const ERROR = require('path').basename(__filename).slice(0,-4)
const CODE = require("../Codes")[ERROR]

const FORMAT = {
    MetaRepeatAssignment: ({ AT }) => `Invalid value assignment of \`repeat\` \`Meta\` attribute. AT: ${AT}`,
    MetaNameAssignment: ({ AT }) => `Invalid value assignment of \`name\` \`Meta\` attribute. AT: ${AT}`,
    MetaModeAssignment: ({ AT }) => `Invalid value assignment of \`mode\` \`Meta\` attribute. AT: ${AT}`,
    MetaSwitchesAssignment: ({ AT }) => `Invalid value assignment of \`switches\` \`Meta\` attribute. Invalid \`switch\` Name. AT: ${AT}`,
    MetaNonAttribute: ({ AT }) => `Attempted to set \`Meta\` atribute that does not exist. AT: ${AT}`,

    ArgumentMissing: ({ AT }) => `Function call (native or imported) is missing arguments. AT: ${AT}`,
    ArgumentExtra: ({ AT }) => `Function call (native or imported) received extra arguments. AT: ${AT}`,
    ArgumentTypeMismatch: ({ AT, ARG, EXPECTED }) => `Function call (native or imported) did not match any of the valid types. AT: ${AT}, ARG: ${ARG}, EXPECTED: ${EXPECTED}`,
    ArgumentUndefined: ({ AT }) => `Argument passed to imported function is undefined (Instruction was presumably injected by another imported function). AT: ${AT}`,

    ParamTypeDeclaredOpposite: ({ AT }) => `Parameter variable is already declared to be of the opposite type. AT: ${ AT }`, // Already exists, declared opposite, this is for params
    ParamDeclaredConstant: ({ AT }) => `Parameter variable is already declared a constant, so it cannot be changed. AT: ${ AT }`, // Declared mode but tried to make it a param
    ParamTypeNotExist: ({ AT }) => `Parameter type does not exist, is not VECTOR or BOOL (For native Func). AT: ${ AT }`,

    NonBoolExpression: ({ AT }) => `Did not receive a boolean expression. AT: ${AT}`,
    NonMathExpression: ({ AT }) => `Did not receive a math expression. AT: ${AT}`,

    AssignedVectorNonNumber: ({ AT }) => `Assignment for VECTOR does not include any numbers. AT: ${AT}`,
    AssignedVectorEmpty: ({ AT }) => `Value in VECTOR assignment is not a number. AT ${AT}`,

    NegativeHoldOrWait: ({ VALUES }) => `Negative hold or wait in key expression. VALUES: ${VALUES}`,

    KeyNotExist: ({ AT }) => `Key is invalid (not mapped by Simkey). AT: ${AT}`,

    AssignmentToConstant: ({ AT }) => `Attempted to assign to a constant. AT: ${AT}`,
    AssignmentTypeMismatch: ({ AT, VAR }) => `Attempted to assign to a value with mismatched type. AT: ${AT}, VAR: ${VAR}`,
    AssignmentDivideByZero: ({ AT }) => `Attempted to divide by zero in assignment. AT: ${AT}`,
    AssignmentNoReturnValue: ({ AT }) => `Function used in assignment did not yield a value. AT: ${AT}`,
    AssignmentNonExistent: ({ AT }) => `Assigning with non \`=\` on a non-existent variable.`,
    AssignmentConstantExists: ({ AT }) => `Attempting to declare a constant when the variable already exists. AT: ${AT}`,
    AssignmentToStringCharacter: ({ AT }) => `Attempting to assign a specific character in string. AT: ${AT}`,

    ReturnWithoutValue: ({ AT }) => `Function used in return statement did not yield a value. AT : ${AT}`,
    ReturnMissingValue: ({ AT }) => `Return statement did not have a value given after it.`,

    InvalidInputVectorBounds: ({ AT, REASON }) => `Invalid bounds for input vector. REASON: ${REASON}, AT: ${AT}`,
    InvalidInputType: ({ AT }) => `Invalid input type for variable. AT: ${AT}`,
    InvalidInputDefaultValue: ({ AT, REASON }) => `Invalid default value given. AT: ${AT}, REASON: ${REASON}`,
    InvalidTypeInMBExpression: ({ AT }) => `Math or boolean expression received an object that the parser cannot handle. AT: ${AT}`,

    TypeMismatch: ({ AT, EXPECTED }) => `Attempted to get variable conforming to accepted types. AT: ${AT}, EXPECTED TYPES: ${EXPECTED}`
}

module.exports = { ERROR, CODE, FORMAT }