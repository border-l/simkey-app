let string = ""

function getPixel(x, y) {
    return [0, 0, 0]
}

function getCursor() {
    return [0, 0]
}

function getScreenSize() {
    return [4000, 4000]
}

function sleep(ms) {
    string += `\nw${ms}`
}

function send(input) {
    string += `\n${input[1] ? "p" : "r"}${input[0]}`
}

function scroll(x) {
    string += `\ns${x}`
}

function setCursor(x, y) {
    string += `\nc${x},${y}`
}

function setCursorR(x, y) {
    string += `\nc${x},${y}`
}

function getString() {
    return string.length > 0 ? string.slice(1) : string
}

module.exports = {send, cursor: setCursor, cursorR: setCursorR, scroll, sleep, getCursor, getPixel, getScreenSize, getString}