// Loop until broken or returned
async function loop(INFO, BLOCK) {
    while (true) {
        const ended = await INFO.RUN(INFO, BLOCK)
        if (INFO.YIELD.BREAK(ended)) break
        if (INFO.YIELD.RETURN(ended)) return ended
        if (INFO.CONTEXT.ABORT.signal.aborted) return
    }
}

module.exports = { FUNCTION: loop, TAKES: { PARAMS: "", BLOCK: true, DONT_PARSE_BLOCK: false } }