const ThrowError = require('../errors/ThrowError')

// Imports simkey funcs, as well as JS ones if included in label (name)
function importSimkeyFunc(context, path, name) {
    const interpreter = new context.Interpreter(path)
    const exports = interpreter.getExport(name)

    // Copy over into IMPORTS
    for (const key in exports.IMPORTS) {
        context.model.IMPORTS[key] = exports.IMPORTS[key]
    }

    // Copy into FUNCS (need to initialize params first (not anymore))
    for (const key in exports.FUNCS) {
        if (key === "@init") context.model.MACRO.push(...exports.FUNCS[key])
        else context.funcs[key] = exports.FUNCS[key]
    }
}

module.exports = importSimkeyFunc