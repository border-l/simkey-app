const ThrowError = require("../errors/ThrowError")

// Gets export functions from label name
function getExport(context, name) {
    // Get contents of label
    const thisExport = context.model.EXPORTS[name]
    if (!thisExport) ThrowError(4305, { AT: name })

    // How exported object is formatted
    const out = { IMPORTS: {}, FUNCS: {} }

    // Function in label
    for (const func of thisExport) {
        // IMPORTS (js) requires two (@ & without), FUNC only one
        if (context.model.IMPORTS[func]) {
            out.IMPORTS[func] = context.model.IMPORTS[func]
            out.IMPORTS[func.slice(1)] = context.model.IMPORTS[func.slice(1)]
        }
        else if (context.funcs[func]) {
            out.FUNCS[func] = context.funcs[func]
        }
        else {
            ThrowError(4400, { AT: func })
        }
    }

    return out
}

module.exports = getExport