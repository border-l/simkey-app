// Holds keys while performing expressions in block
function withKeys(INFO, BLOCK, Keys) {
    // Expression to hold relevant keys
    const keyExpressions = { hold: 0, wait: 25, keysPressed: [], keysHeld: [...Keys.replace(/\s/g, '').split(",")] }

    // Move block expressions into LIST
    INFO.LIST.splice(INFO.INDEX + 1, 0, keyExpressions, ...BLOCK, keyExpressions)
}

module.exports = { FUNCTION: withKeys, TAKES: { PARAMS: "[LOOSE]", BLOCK: true } }