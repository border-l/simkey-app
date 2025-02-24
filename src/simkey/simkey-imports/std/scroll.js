// Scroll amount times
function scroll(INFO, amount) {
    // Simply round amount, use s keyc command
    return `s${Math.round(amount)}`
}

module.exports = { FUNCTION: scroll, TAKES: { PARAMS: "[NUM]" }}