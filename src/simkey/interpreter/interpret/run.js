const instructionRunner = require("./instructionRunner")
const robot = require("../robot/robot")
const debugRobot = require("../robot/debugRobot")

const breakSymbol = Symbol("BREAK_STRING")
const nextSymbol = Symbol("NEXT_SYMBOL")
const returnSymbol = Symbol("RETURN_STRING")

const { randomUUID } = require("crypto")

// Interprets the file
async function run(context) {
    const instructionList = context.model.MACRO
    const def = [100, 100]
    const heldKeys = []

    let i = 0
    while (context.repeat === -1 || i < context.repeat) {
        // Setup functions
        for (const key in context.model.IMPORTS) {
            if (key[0] !== "@") continue
            await context.model.IMPORTS[key].SETUP()
        }

        // passedInfo.ERROR is an array so that reference is preserved through deep clones
        const passedInfo = {
            DEF: def,
            HELD: heldKeys,
            CONTEXT: context,
            ROBOT: !context.debug ? robot : debugRobot,
            RUN: instructionRunner,
            SYMBOLS: { BREAK: breakSymbol, NEXT: nextSymbol, RETURN: returnSymbol },
            YIELD: {
                BREAK: (val) => val === breakSymbol,
                NEXT: (val) => val === nextSymbol,
                RETURN: (val) => Array.isArray(val) && val[0] === returnSymbol
            },
            SHARED: {},
            RUNNING: new Set(),
            UUID: randomUUID,
            ERROR: [null]
        }

        // Interpret list
        instructionRunner(passedInfo, instructionList, false, true)
            .catch(err => passedInfo.ERROR = err.message)

        // Check if completed or interrupted
        while (true) {
            await new Promise(r => setTimeout(r, 10))
            if (context.ABORT.signal.aborted) return
            if (passedInfo.ERROR[0] !== null) throw new Error(passedInfo.ERROR)
            if (passedInfo.RUNNING.size === 0) break
        }

        // Release all held down keys
        for (const key of heldKeys) {
            robot.send([key, false])
        }

        // Cleanup functions
        for (const key in context.model.IMPORTS) {
            if (key[0] !== "@") continue
            await context.model.IMPORTS[key].CLEANUP(passedInfo)
        }

        i += 1
    }
}

module.exports = run