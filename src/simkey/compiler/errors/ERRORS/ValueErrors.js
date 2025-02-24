const ERROR = require('path').basename(__filename).slice(0,-4)
const CODE = require("../Codes")[ERROR]

const FORMAT = {
    SettingsRepeatAssignment: ({ AT }) => `Invalid value assignment of \`repeat\` \`SETTINGS\` attribute. AT: ${AT}`,
    SettingsNameAssignment: ({ AT }) => `Invalid value assignment of \`name\` \`SETTINGS\` attribute. AT: ${AT}`,
    SettingsModeAssignment: ({ AT }) => `Invalid value assignment of \`mode\` \`SETTINGS\` attribute. AT: ${AT}`,
    SettingsSwitchesAssignment: ({ AT }) => `Invalid value assignment of \`switches\` \`SETTINGS\` attribute. Invalid \`switch\` Name. AT: ${AT}`,
    SettingsNonAttribute: ({ AT }) => `Attempted to set \`SETTINGS\` atribute that does not exist. AT: ${AT}`,

    ArgumentMissing: ({ AT }) => `Function call (native or imported) is missing arguments. AT: ${AT}`,
    ArgumentExtra: ({ AT }) => `Function call (native or imported) received extra arguments. AT: ${AT}`,
    ArgumentTypeMismatch: ({ AT, ARG, EXPECTED }) => `Function call (native or imported) did not match any of the valid types. AT: ${AT}, ARG: ${ARG} EXPECTED: ${EXPECTED}`,
    ArgumentUndefined: ({ AT }) => `Argument passed to imported function is undefined (Instruction was presumably injected by another imported function). AT: ${AT}`,

    ParamTypeDeclaredOpposite: ({ AT }) => `Parameter variable is already declared to be of the opposite type. AT: ${ AT }`, // Already exists, declared opposite, this is for params
    ParamDeclaredMode: ({ AT }) => `Parameter variable is already declared a MODE, so it cannot be changed. AT: ${ AT }`, // Declared mode but tried to make it a param
    ParamTypeNotExist: ({ AT }) => `Parameter type does not exist, is not VECTOR or BOOL (For native Func). AT: ${ AT }`,

    NonBoolExpression: ({ AT }) => `Did not receive a boolean expression. AT: ${AT}`,
    NonMathExpression: ({ AT }) => `Did not receive a math expression. AT: ${AT}`,

    AssignedVectorNonNumber: ({ AT }) => `Assignment for VECTOR does not include any numbers. AT: ${AT}`,
    AssignedVectorEmpty: ({ AT }) => `Value in VECTOR assignment is not a number. AT ${AT}`,

    NegativeHoldOrWait: ({ VALUES }) => `Negative hold or wait in key expression. VALUES: ${VALUES}`
}

module.exports = { ERROR, CODE, FORMAT }