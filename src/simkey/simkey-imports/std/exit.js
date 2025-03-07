// Throws error
function exit(INFO, msg) {
    throw Error(`EXIT ERROR from script: ${msg}`)
}

module.exports = { FUNCTION: exit, TAKES: { PARAMS: "[LOOSE]" } }