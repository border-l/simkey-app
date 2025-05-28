const path = require("path")
const mapping = require("./mapping")
const ThrowError = require("../errors/ThrowError")

const koffi = require("koffi")
const lib = koffi.load(path.resolve(__dirname, 'robot.dll'))

const keyDown = lib.func("void keyDown(unsigned char key)")
const keyUp = lib.func("void keyUp(unsigned char key)")
const mouseDown = lib.func("void mouseDown(int button)")
const mouseUp = lib.func("void mouseUp(int button)")
const setCursor = lib.func("void setCursor(int x, int y)")
const setCursorNA = lib.func("void setCursorNA(int x, int y)")
const setCursorR = lib.func("void setCursorR(int x, int y)")
const scroll = lib.func("void scroll(int amount)")
const getCursor = lib.func("void getCursor(_Out_ int* coords)")
const getScreenSize = lib.func("void getScreenSize(_Out_ int* size)")
const getPixelColor = lib.func("void getPixelColor(int x, int y, _Out_ int* rgb)")


// Sleeps with granularity of about 5ms while yielding to abort
function sleep(ms, signal) {
    return new Promise((resolve, reject) => {
        if (signal.aborted) return reject(new Error('ABORTED'))

        const timeout = setTimeout(() => {
            signal.removeEventListener('abort', onAbort)
            resolve()
        }, ms)

        const onAbort = () => {
            clearTimeout(timeout)
            reject(new Error('ABORTED'))
        }

        signal.addEventListener('abort', onAbort, { once: true })
    })
}


// Sends an input with key and isDown
function send(input) {
    if (!Array.isArray(input)) ThrowError(2600, { AT: "non-array given to robot.send function" })

    const [key, down] = input
    const map = mapping[key]

    if (map === undefined) ThrowError(2600, { AT: key })

    if (map.shift === null) {
        down ? mouseDown(map.code) : mouseUp(map.code)
        return
    }

    const keyFunc = down ? keyDown : keyUp
    if (map.shift) keyFunc(mapping.SHIFT.code)
    keyFunc(map.code)
}


module.exports = { send, setCursor, setCursorR, setCursorNA, scroll, sleep, getCursor, getScreenSize, getPixelColor }