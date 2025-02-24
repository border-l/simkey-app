const deepClone = require("./helpers/deepClone")

// Repeats block num times
function repeat(INFO, BLOCK, num) {
    // Break at end, no ending main program
    if (BLOCK[BLOCK.length - 1] === "@end") {
        INFO.LIST.splice(INFO.INDEX + 1, 0, ...BLOCK.slice(0,-1))
        return
    }
    
    // Clone block and add it to LIST
    for (let i = 0; i < num; i++) {
        INFO.LIST.splice(INFO.INDEX + 1, 0, ...BLOCK)
        BLOCK = deepClone(BLOCK)
    }
}

module.exports = { FUNCTION: repeat, TAKES: { PARAMS: "[NUM]", BLOCK: true, DONT_PARSE_BLOCK: false } }