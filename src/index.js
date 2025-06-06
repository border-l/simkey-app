const { app, BrowserWindow, ipcMain, dialog, globalShortcut, screen, shell } = require('electron')
const started = require('electron-squirrel-startup')
const path = require('path')

const fs = require('fs-extra')
const appVersion = "v" + app.getVersion()
const scriptsPath = path.join(app.getPath('userData'), appVersion, 'scripts.json')
const simkeyPath = path.join(app.getAppPath(), 'src', 'simkey', 'SimkeyInterpreter.js')

const Interpret = require(simkeyPath)

let mainWindow
let utilWindow
let cursorListener

const running = {};


/*........ App startup ........*/

(async () => {
    app.whenReady().then(() => {
        createWindow()

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow()
            }
        })
    })

    await fs.mkdir(path.dirname(scriptsPath), { recursive: true })

    try {
        await fs.access(scriptsPath)

        fs.readFile(scriptsPath, "utf-8")
            .then(data => JSON.parse(data))
            .then(scripts => {
                for (const script in scripts) {
                    if (script === "ORDER") continue
                    if (scripts[script].SHORTCUT === null) continue
                    if (addShortcut(scripts[script].SHORTCUT, script) !== true) throw Error(`${scripts[script].TITLE} — ${scripts[script].SHORTCUT}`)
                }
            })
            .catch((err) => dialog.showErrorBox(
                "An Error Occured",
                `Error setting global shortcuts. A shortcut may be invalid or already taken by another program: ${err.message}.`))
    }

    catch (err) {
        await fs.writeFile(scriptsPath, JSON.stringify({ ORDER: [] }, null, 4))
    }
})()


if (started) app.quit()
app.on('window-all-closed', () => {
    globalShortcut.unregisterAll()
    if (process.platform !== 'darwin') app.quit()
})


/*........ Helpers ........*/

function createWindow() {
    mainWindow = new BrowserWindow({
        height: 615,
        width: 800,
        minHeight: 615,
        minWidth: 800,
        maxHeight: 615,
        maxWidth: 800,
        backgroundColor: '#121212',
        show: false,
        icon: path.join(__dirname, 'assets/main_logo.png'),
        webPreferences: {
            preload: path.join(__dirname, 'mainPreload.js'),
            devTools: true
        },
    })

    mainWindow.loadFile(path.join(__dirname, './main-window/index.html'))
    mainWindow.setMenuBarVisibility(null)

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })
}


function validateSingleInput(value, type, bounds) {
    if ((type === "MODE" || type === "SWITCH") && typeof value !== "boolean") return false
    if (type === "STRING" && typeof value !== "string") return false
    if (type === "NUMBER" && ((isNaN(value) || typeof value !== "number")
        || value < bounds[0] || (value > bounds[1] && bounds[1] !== null))) return false
    if (type === "VECTOR" && (!Array.isArray(value)
        || value.some(val => isNaN(val) || typeof val !== "number")
        || value.length < bounds[0] || (value.length > bounds[1] && bounds[1] !== null))) return false
    if (type === null) return false

    return true
}


function getType(name, inputs) {
    if (inputs.MODES.includes(name)) return "MODE"
    if (inputs.SWITCHES.includes(name)) return "SWITCH"
    if (inputs.STRINGS.includes(name)) return "STRING"
    if (inputs.NUMBERS[name] !== undefined) return "NUMBER"
    if (inputs.VECTORS[name] !== undefined) return "VECTOR"

    return null
}


function validateInputs(inputs, values) {
    let modeSet = false

    for (const varName in values) {
        const type = getType(varName, inputs)
        if (!validateSingleInput(values[varName], type, inputs.VECTORS[varName] || inputs.NUMBERS[varName])) return false

        if (type === "MODE" && values[varName]) {
            if (modeSet) return false
            modeSet = true
        }
    }

    return true
}


function addShortcut(shortcut, path) {
    if (shortcut === null) return

    if (validateShortcut(shortcut) !== true) {
        return false
    }

    globalShortcut.register(shortcut, () => {
        toggleScript(path)
    })

    return true
}


function validateShortcut(shortcut) {
    try {
        if (globalShortcut.isRegistered(shortcut)) return 10
    }
    catch (err) {
        return 20
    }

    globalShortcut.register(shortcut, () => { })
    if (!globalShortcut.isRegistered(shortcut)) return 20

    globalShortcut.unregister(shortcut)
    return true
}


function fixInputs(location, scriptInfo, inputs = null) {
    if (inputs === null) inputs = (new Interpret(location)).getInputs()
    const { VARIABLES, INPUTS } = inputs

    scriptInfo.validInputs = inputs.INPUTS

    const allVariables = [...INPUTS.MODES, ...INPUTS.SWITCHES, ...INPUTS.STRINGS, ...Object.keys(INPUTS.NUMBERS), ...Object.keys(INPUTS.VECTORS)]

    for (const varName of allVariables) {
        if (scriptInfo.inputValues[varName] === undefined) {
            scriptInfo.inputValues[varName] = VARIABLES[varName]
        }
    }

    for (const varName in scriptInfo.inputValues) {
        if (getType(varName, INPUTS) === null) {
            delete scriptInfo.inputValues[varName]

            let type = getType(varName, scriptInfo.validInputs)

            if (type === null) {
                continue
            }

            type += type === "SWITCH" ? "ES" : "S"

            const inGrp = scriptInfo.validInputs[type]
            if (type === "VECTORS" || type === "NUMBERS") delete inGrp[varName]
            else inGrp.splice(inGrp.indexOf(varName), 1)

            continue
        }

        if (!validateSingleInput(scriptInfo.inputValues[varName], getType(varName, INPUTS),
            INPUTS.VECTORS[varName] || INPUTS.NUMBERS[varName])) {
            scriptInfo.inputValues[varName] = VARIABLES[varName]
        }
    }

    return true
}


async function toggleScript(path) {
    if (running[path] !== undefined) {
        running[path].stop()
        delete running[path]
        mainWindow.webContents.send("run-message", { path, running: false, error: null })
        return
    }

    const scripts = JSON.parse(await fs.readFile(scriptsPath, "utf-8"))

    try {
        running[path] = new Interpret(path)
        if (fixInputs(path, scripts[path], running[path].getInputs())) await fs.writeFile(scriptsPath, JSON.stringify(scripts, null, 4))
    }
    catch (err) {
        mainWindow.webContents.send("run-message", { path, running: false, error: err.message })
        return
    }

    running[path].setInputs(scripts[path].inputValues)
    mainWindow.webContents.send("run-message", { path, running: true, error: null })

    try {
        await running[path].run()
        delete running[path]
        mainWindow.webContents.send("run-message", { path, running: false, error: null })
    }
    catch (err) {
        delete running[path]
        mainWindow.webContents.send("run-message", { path, running: false, error: err.message })
    }
}


function basenameNS(filePath) {
    let base = path.basename(filePath)
    base = base.slice(0, base.indexOf("."))
    return base
}


/*........ Handlers ........*/

ipcMain.handle('open-script', async (event, location) => {
    shell.openPath(location)
})


ipcMain.handle('get-script-options', async (event, location) => {
    const scripts = JSON.parse(await fs.readFile(scriptsPath, "utf-8"))

    try {
        if (fixInputs(location, scripts[location])) await fs.writeFile(scriptsPath, JSON.stringify(scripts, null, 4))
        return { err: false, loaded: scripts[location] }
    }
    catch (err) {
        return { err: true, errTitle: "Error with Script INPUTS", errMessage: err.message }
    }
})


ipcMain.handle('run-stop-script', async (event, location) => {
    return toggleScript(location)
})


ipcMain.handle('load-scripts', async () => {
    const scripts = JSON.parse(await fs.readFile(scriptsPath, "utf-8"))
    const scriptObj = {}

    for (const script in scripts) {
        if (script === "ORDER") continue
        scriptObj[script] = [scripts[script].TITLE, scripts[script].VERSION, script]
    }

    return { scripts: scriptObj, order: scripts.ORDER }
})


ipcMain.handle('remove-script', async (event, location) => {
    const scripts = JSON.parse(await fs.readFile(scriptsPath, "utf-8"))

    if (!scripts[location]) return false

    try {
        if (scripts[location].SHORTCUT !== null) globalShortcut.unregister(scripts[location].SHORTCUT)
        if (running[location]) toggleScript(location)

        delete scripts[location]
        await fs.writeFile(scriptsPath, JSON.stringify(scripts, null, 4))

        return true
    }

    catch (err) {
        dialog.showErrorBox("An Error Occured", `The script located in "${location}" could not be removed.\n${err}`)
        return false
    }
})


ipcMain.handle('save-script', async (event, location, options) => {
    const scripts = JSON.parse(await fs.readFile(scriptsPath, "utf-8"))

    let currentInputs

    try {
        currentInputs = await (new Interpret(location)).getInputs()
    }
    catch (err) {
        return {
            err: true,
            errTitle: "Error While Getting INPUTS",
            errMessage: err.message,
            saved: false
        }
    }

    if (validateInputs(currentInputs.INPUTS, scripts[location].inputValues) !== true) {
        fixInputs(location, scripts[location], currentInputs)
        await fs.writeFile(scriptsPath, JSON.stringify(scripts, null, 4))
        return {
            saved: false,
            reload: true
        }
    }

    if (validateInputs(options.validInputs, options.inputValues) !== true) return false

    if (options.SHORTCUT !== null && options.SHORTCUT !== scripts[location].SHORTCUT) {
        if (!addShortcut(options.SHORTCUT, location)) {
            return {
                saved: false,
                reload: false
            }
        }

        if (scripts[location].SHORTCUT !== null) {
            globalShortcut.unregister(scripts[location].SHORTCUT)
        }
    }

    if (options.SHORTCUT === null && scripts[location].SHORTCUT !== null) {
        globalShortcut.unregister(scripts[location].SHORTCUT)
    }

    scripts[location] = options
    await fs.writeFile(scriptsPath, JSON.stringify(scripts, null, 4))

    return {
        saved: true,
        reload: false
    }
})


ipcMain.handle('load-new-script', async (event) => {
    const { canceled: cancelled, filePaths } = await dialog.showOpenDialog({
        title: "Select a Simkey Script",
        properties: ["openFile"],
        filters: [
            { name: 'Simkey Files', extensions: ["simkey", "skey", "txt"] }
        ]
    })

    if (cancelled) {
        return false
    }

    try {
        const scripts = JSON.parse(await fs.readFile(scriptsPath, "utf-8"))

        if (scripts[filePaths[0]]) {
            return false
        }

        const openFile = new Interpret(filePaths[0])
        const { INPUTS, VARIABLES } = openFile.getInputs()

        const scriptInfo = {
            ...openFile.getMeta(),
            validInputs: INPUTS,
            inputValues: VARIABLES
        }

        scripts.ORDER.push(filePaths[0])

        if (scriptInfo.TITLE === "") scriptInfo.TITLE = basenameNS(filePaths[0])

        let err = false
        let errTitle, errMessage = undefined

        if (scriptInfo.SHORTCUT !== null && !addShortcut(scriptInfo.SHORTCUT, filePaths[0])) {
            err = true
            errTitle = "An Error Occured"
            errMessage = "Shortcut in the SETTINGS section of Simkey script is invalid or is already taken by another program or script. No shortcut has been set for this script."
            scriptInfo.SHORTCUT = null
        }

        scripts[filePaths[0]] = scriptInfo
        await fs.writeFile(scriptsPath, JSON.stringify(scripts, null, 4))

        return {
            err,
            errTitle, errMessage,
            loaded: {
                TITLE: scriptInfo.TITLE,
                PATH: filePaths[0],
                VERSION: scriptInfo.VERSION
            }
        }
    }

    catch (err) {
        return {
            err: true,
            errTitle: "Error loading from file",
            errMessage: `Error occured while loading INPUTS from the file. ERROR:\n${err}`,
        }
    }
})


ipcMain.handle('save-script-order', async (event, order) => {
    const scripts = JSON.parse(await fs.readFile(scriptsPath, "utf-8"))
    scripts.ORDER = order

    await fs.writeFile(scriptsPath, JSON.stringify(scripts, null, 4))
})


ipcMain.handle('open-utilities-window', async (event) => {
    if (utilWindow) {
        return
    }

    utilWindow = new BrowserWindow({
        height: 150,
        width: 800,
        minHeight: 150,
        minWidth: 800,
        maxHeight: 150,
        maxWidth: 800,
        icon: path.join(__dirname, 'assets/main_logo.png'),
        webPreferences: {
            preload: path.join(__dirname, 'utilsPreload.js'),
            devTools: false
        },
    })

    utilWindow.loadFile(path.join(__dirname, './utils-window/index.html'))
    utilWindow.setMenuBarVisibility(null)

    utilWindow.on("close", (event) => {
        clearInterval(cursorListener)
        cursorListener = null
        utilWindow = null
    })
})


ipcMain.handle('listen-cursor', async (event, switchOn) => {
    if (cursorListener) {
        clearInterval(cursorListener)
        cursorListener = null
    }
    else if (switchOn) {
        clearInterval(cursorListener)
        cursorListener = setInterval(() => {
            const mousePos = screen.getCursorScreenPoint()
            utilWindow.webContents.send("cursor-update", mousePos)
        }, 50)
    }
})