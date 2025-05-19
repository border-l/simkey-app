// Loop until broken or returned
async function loop(INFO, BLOCK) {
    while (true) {
        const ended = await INFO.RUN(INFO, BLOCK)
        if (INFO.YIELD.END(ended)) break
        if (INFO.YIELD.RETURN(ended)) return ended
    }
}

module.exports = { FUNCTION: loop, TAKES: { PARAMS: "", BLOCK: true, DONT_PARSE_BLOCK: false }}