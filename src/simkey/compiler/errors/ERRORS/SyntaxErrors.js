const ERROR = require('path').basename(__filename).slice(0,-4)
const CODE = require("../Codes")[ERROR]

const FORMAT = {
    MissingEndString: ({ AT }) => `No ending \`"\`. AT: ${AT}`,
    MissingStartString: ({ AT }) => `No start to string \`"\`. AT: ${AT}`,
    MissingArrayEnd: ({ AT }) => `No ending \`]\`. AT: ${AT}`,
    MissingArrayStart: ({ AT }) => `No starting \`[\`. AT: ${AT}`,
    MissingBracketBlock: ({ AT }) => `No closing bracket or end to section found. AT: ${AT}`, // parseInnards "appropriate end"
    MissingKeyBracket: ({ AT }) => `Key in expression is missing closing bracket. AT: ${AT}`, // For parseExpression no closing brackets
    MissingConditional: ({ AT }) => `Missing conditional expression for @if or @elseif. AT: ${AT}`,
    MissingAtFunc: ({ AT }) => `Function declaration is missing @. AT ${AT}`,
    MissingBlockFuncDeclaration: ({ AT }) => `Missing block for Func body. AT: ${ AT }`,
    MissingBlockConditionOrCall: ({ AT }) => `Missing block for imported function call or conditional. AT: ${ AT }`,
    MissingFirstIf: ({ AT }) => `Conditional is missing the initial @if. AT: ${AT}`,

    IllegalName: ({ AT }) => `Illegal name of variable. AT: ${AT}`,
    IllegalFuncName: ({ AT }) => `Illegal Func name (already a built-in, missing, or is invalid). AT: ${AT}`,
    IllegalExpression: ({ AT }) => `Illegal key expression. AT: ${AT}`,
    IllegalMBExpression: ({ AT }) => `Illegal math or boolean expression. AT: ${AT}`, // Math/boolean
    IllegalConditionGiven: ({ AT }) => `Conditional expression is given to @else. AT: ${AT}`, // @else given condition
    IllegalTokenInCondition: ({ AT }) => `Illegal token present in condition expression. AT: ${AT}`,
    IllegalConditionStructure: ({ AT }) => `Condition structure is invalid. AT: ${AT}`,
    IllegalConditionFuncCall: ({ AT }) => `Invalid structure for boolean function call in condition. AT: ${AT}`, // For condition functions structured badly

    ExpressionHeldNotLast: ({ AT }) => `Held expression must come at the end of the key expression. AT: ${AT}`, // Held must come last in expression
    ExpressionEscapeAtEnd: ({ AT }) => `Escape character at the end of expression. AT: ${AT}`, // Escape character at the end
    ExpressionKeyHeldAndPressed: ({ AT }) => `Key declared as both held and pressed in expression. AT: ${AT}`,
    ExpressionDuplicateKey: ({ AT }) => `Key has been declared pressed or held more than once. AT: ${AT}`,
    ExpressionHeldNoInputs: ({ AT }) => `Held expression in expression with no keys specified. AT: ${AT}`,

    SectionMacroNotLast: ({ AT }) => `MACRO section should be last in simkey script.`,
    SectionNotExist: ({ AT }) => `Section set is not a valid section. AT: ${AT}`,

    UnterminatedBlock: ({ AT }) => `Unterminated block; something extends past block (Array, String or Comment). AT: ${AT}`, // Something extends past the block

    DeclarationDuplicateConstant: ({ AT }) => `Duplicate declaration of constant, AT: ${AT}`,
    DeclarationDuplicateFlag: ({ AT }) => `Duplicate declaration of flag, AT: ${AT}`,
    DeclarationFlagOutsideMacro: ({ AT }) => `Flag is delcared outside of MACRO section. AT: ${AT}`,

    AssignmentOperatorMissing: ({ AT, SECTION }) => `Assignment in \`${SECTION}\` section does not include an equal sign. AT: \`${AT}\` \nNOTE: it should be separated by a space in both directions`,
}

module.exports = { ERROR, CODE, FORMAT }