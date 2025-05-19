// Repeats block num times
async function repeat(INFO, BLOCK, num) {
    // Clone block and add it to LIST
    for (let i = 0; i < num; i++) {
        const ended = await INFO.RUN(INFO, BLOCK)
        if (INFO.YIELD.END(ended)) break
        if (INFO.YIELD.RETURN(ended)) return ended
    }
}

module.exports = { FUNCTION: repeat, TAKES: { PARAMS: "[NUM]", BLOCK: true, DONT_PARSE_BLOCK: false } }