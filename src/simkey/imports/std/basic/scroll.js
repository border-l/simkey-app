// Scroll amount times
async function scroll(INFO, amount) {
    // Simply round amount, use s keyc command
    await INFO.ROBOT.scroll(Math.round(amount))
}

module.exports = { FUNCTION: scroll, TAKES: { PARAMS: "[NUM]" }}