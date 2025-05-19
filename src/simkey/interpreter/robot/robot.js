const path = require("path")
const mapping = require("./mapping")
const ThrowError = require("../errors/ThrowError")

// Boilerplate to access lib functions
const ffi = require("ffi-napi")
const ref = require("ref-napi")
const intArrayType = ref.refType(ref.types.int)
const libPath = path.resolve(__dirname, 'robot')
const robot = ffi.Library(libPath, {
    'keyDown': ['void', ['uchar']],
    'keyUp': ['void', ['uchar']],
    'mouseDown': ['void', ['int']],
    'mouseUp': ['void', ['int']],
    'setCursor': ['void', ['int', 'int']],
    'setCursorR': ['void', ['int', 'int']],
    'setCursorNA': ['void', ['int', 'int']],
    'scroll': ['void', ['int']],
    'getCursor': ['void', [intArrayType]],
    'getScreenSize': ['void', [intArrayType]],
    'getPixelColor': ['void', ['int', 'int', intArrayType]]
})

// Sleeps with granularity of about 5ms?
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// Sends an input with key name and whether to send down or up
function send(input) {
    if (!Array.isArray(input)) ThrowError(2600, { AT: "non-array given to robot.send function" })
    const [key, down] = input
    const map = mapping[key]
    if (map === undefined) ThrowError(2600, { AT: key })

    if (map.shift === null) {
        down ? robot.mouseDown(map.code) : robot.mouseUp(map.code)
        return
    }

    const send = down ? robot.keyDown : robot.keyUp
    if (map.shift) send(mapping.SHIFT.code)
    send(map.code)
}

// C function, gets current cursor position
function getCursor() {
    const coords = Buffer.alloc(2 * ref.types.int.size)
    robot.getCursor(coords)
    return BufferToArray(coords)
}

// C function, gets pixel at x,y
function getPixel(x, y) {
    const color = Buffer.alloc(3 * ref.types.int.size)
    robot.getPixelColor(x, y, color)
    return BufferToArray(color)
}

// C function, gets screen size
function getScreenSize() {
    const size = Buffer.alloc(2 * ref.types.int.size)
    robot.getScreenSize(size)
    return BufferToArray(size)
}

// Converts a buffer to array by reading 32 bits each time
function BufferToArray(buff) {
    const res = []
    for (let i = 0; i < buff.length; i+= 4) {
        res.push(buff.readInt32LE(i))
    }
    return res
}

module.exports = {send, cursor: robot.setCursor, cursorR: robot.setCursorR, cursorNA: robot.setCursorNA, scroll: robot.scroll, sleep, getCursor, getPixel, getScreenSize}