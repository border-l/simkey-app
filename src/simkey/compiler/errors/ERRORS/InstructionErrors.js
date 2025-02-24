const ERROR = require('path').basename(__filename).slice(0,-4)
const CODE = require("../Codes")[ERROR]

const FORMAT = {
    SettingsKeyNotExist: ({ AT }) => `Key in settings object does not exist in MODES or SWITCHES. AT: ${AT}`, // All of these are for setSettings (settings used in compiling)
    SettingsSeveralModesSet: ({ AT }) => `Several modes have been set to true in settings object. AT: ${AT}`,
    SettingsNonBooleanValue: ({ AT }) => `Key in settings object does not have a boolean value. AT: ${AT}`,

    SetNonExistent: ({ VAR, TYPE }) => `Attempting to set a non-existent variable of type ${TYPE} (USING \`SET\`). VAR: ${VAR}`, // All of these are for the `SET` instruction (in handleSET)
    SetVectorNonArray: ({ VECTOR, VALUE_TYPE }) => `Attempting to set a vector to a non-array (USING \`SET\`). VECTOR: ${VECTOR}, VALUE_TYPE: ${VALUE_TYPE}`,
    SetIndexNonNumber: ({ VECTOR, INDEX }) => `Attempting to set a non-number index (USING \`SET\`). VECTOR: ${VECTOR}, INDEX: ${INDEX}`,
    SetNonNumberElement: ({ VECTOR, VALUE }) => `Attempting to set a component of a vector to a non-number (USING \`SET\`). VECTOR: ${VECTOR}, VALUE: ${VALUE}`,

    InstructionIllegal: ({ AT, CONTEXT }) => `Invalid instruction present. AT: ${AT}, CONTEXT: ${CONTEXT}`, // Honestly not entirely sure, but it's in getInstructionList
    InstructionMissingArguments: ({ AT }) => `Instruction for imported function call is missing arguments. AT: ${AT}`,

    UnknownPropertySet: ({ AT }) => `Attempted to set unknown property in context (Internal Compiler Error). PROPERTY: ${AT}`
}

module.exports = { ERROR, CODE, FORMAT }