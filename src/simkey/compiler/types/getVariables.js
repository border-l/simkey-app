// Returns list of all variables so far
module.exports = (context, vectors = true, switches = true, modes = true) => {
    return [...(vectors ? Object.keys(context.model.VECTORS) : []), ...(switches ? context.model.SWITCHES : []), ...(modes ? context.model.MODES : [])]
}