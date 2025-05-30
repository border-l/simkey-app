// Repeats block num times
async function repeat(INFO, BLOCK, num) {
    // Clone block and add it to LIST
    for (let i = 0; i < num; i++) {
        const ended = await INFO.RUN(INFO, BLOCK)
        if (INFO.YIELD.BREAK(ended)) break
        if (INFO.YIELD.RETURN(ended)) return ended
        if (INFO.CONTEXT.ABORT.signal.aborted) return
    }
}

module.exports = { FUNCTION: repeat, TAKES: { PARAMS: "[NUM]", BLOCK: true, DONT_PARSE_BLOCK: false } }