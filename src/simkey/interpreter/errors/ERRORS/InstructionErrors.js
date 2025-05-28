const ERROR = require('path').basename(__filename).slice(0,-4)
const CODE = require("../Codes")[ERROR]

const FORMAT = {
    // MetaKeyNotExist: ({ AT }) => `Key in Meta object does not exist as an input MODE or SWITCH. AT: ${AT}`, // All of these are for setMeta (Meta used in compiling)
    // MetaSeveralModesSet: ({ AT }) => `Several modes have been set to true in Meta object. AT: ${AT}`,
    // MetaNonBooleanValue: ({ AT }) => `Key in Meta object does not have a boolean value. AT: ${AT}`,
    InputNotExist: ({ AT }) => `Input given to setInput does not exist at all or under its type. AT: ${AT}, TYPE: ${typeof AT}`,
    InputSeveralModesTrue: ({ AT }) => `Several modes have been set to true in the INPUTS object given to setInputs. AT (second): ${AT}`,
    InputInvalidValue: ({ AT, REASON }) => `Invalid value given to setInput. AT: ${AT}, REASON: ${REASON}`,
    InputNoModeDefault: ({ AT }) => `Input modes were present yet no mode is on by default in INPUTS.`,

    SetNonExistent: ({ VAR, TYPE }) => `Attempting to set a non-existent variable of type ${TYPE} (USING \`SET\`). VAR: ${VAR}`, // All of these are for the `SET` instruction (in handleSET)
    SetVectorNonArray: ({ VECTOR, VALUE_TYPE }) => `Attempting to set a vector to a non-array (USING \`SET\`). VECTOR: ${VECTOR}, VALUE_TYPE: ${VALUE_TYPE}`,
    SetIndexNonNumber: ({ VECTOR, INDEX }) => `Attempting to set a non-number index (USING \`SET\`). VECTOR: ${VECTOR}, INDEX: ${INDEX}`,
    SetNonNumberElement: ({ VECTOR, VALUE }) => `Attempting to set a component of a vector to a non-number (USING \`SET\`). VECTOR: ${VECTOR}, VALUE: ${VALUE}`,
    SetConstant: ({ AT }) => `Attempting to set a constant. AT: ${AT}`,

    InstructionIllegal: ({ AT, CONTEXT }) => `Invalid instruction present. AT: ${AT}, CONTEXT: ${CONTEXT}`, // Honestly not entirely sure, but it's in getInstructionList (now removed)
    InstructionMissingArguments: ({ AT }) => `Instruction for imported function call is missing arguments. AT: ${AT}`,
    InstructionMissingFunction: ({ AT }) => `Instruction with non-existent imported function. AT: ${AT}`,

    UnknownPropertySet: ({ AT }) => `Attempted to set unknown property in context (Internal Error). PROPERTY: ${AT}`,

    InputVectorNonExistent: ({ AT }) => `Attempted to input a vector that does not exist. AT: ${AT}`,
    InputVectorNonArray: ({ AT }) => `Attempted to set an input vector to a non-array. AT: ${AT}`,
    InputVectorInvalidArray: ({ AT }) => `Invalid array given to set input vector (invalid length, or contains non-numbers). AT: ${AT}`,

    InvalidTypeGetVariable: ({ AT }) => `Invalid type given to getVariable (Internal Error, likely from imported function). AT: ${AT}`,

    StackSizeExceeded: ({ AT }) => `Function resulted in exceeding JS maximum stack size. AT: ${AT}`,

    InvalidRepeatValue: ({ AT }) => `Invalid REPEAT argument passed into SimkeyInterpreter.run; not a number or boolean. AT: ${AT}`
}

module.exports = { ERROR, CODE, FORMAT }