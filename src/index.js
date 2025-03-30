const { app, BrowserWindow, ipcMain, dialog, globalShortcut, screen, shell } = require('electron')
const path = require('path')
const started = require('electron-squirrel-startup')
const asar = require("@electron/asar")

const { spawn, exec } = require('child_process')
const fs = require('fs-extra')

const appVersion = "v" + app.getVersion()
const scriptsPath = path.join(app.getPath('userData'), appVersion, 'scripts', 'scripts.json')
const keycFilesPath = path.join(app.getPath('userData'), appVersion, 'scripts', 'keyc-files')
const RunKeyCPath = path.join(app.getPath('userData'), appVersion, 'src', 'resources', 'RunKeyC.c')
const RunKeyCExePath = path.join(app.getPath('userData'), appVersion, 'src', 'resources', 'RunKeyC.exe')
const simkeyPath = path.join(app.getPath('userData'), appVersion, 'src', 'simkey', 'SimkeyCompiler.js')

const createWindow = () => {
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
            devTools: false
        },
    })

    mainWindow.loadFile(path.join(__dirname, './main-window/index.html'))
    mainWindow.setMenuBarVisibility(null)

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })
}

let Compiler


const checkAndCreateDir = async (dirPath) => {
    await fs.mkdir(dirPath, { recursive: true })
}


(async () => {
    app.whenReady().then(() => {
        createWindow()
    
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow()
            }
        })
    })

    await checkAndCreateDir(path.dirname(RunKeyCPath))
    await checkAndCreateDir(path.dirname(RunKeyCExePath))
    await checkAndCreateDir(path.dirname(scriptsPath))
    await checkAndCreateDir(keycFilesPath)

    try {
        await fs.access(scriptsPath)

        fs.readFile(scriptsPath, "utf-8").then(data => JSON.parse(data)).then(scripts => {
            for (const script in scripts) {
                addShortcut(scripts[script])
            }
        }).catch((err) => dialog.showErrorBox("An Error Occured", `Error setting global shortcuts. It may already be taken by another program.`))
    }
    catch (err) {
        await fs.writeFile(scriptsPath, JSON.stringify({}, null, 2))
    }

    try {
        await fs.access(simkeyPath)
        Compiler = require(simkeyPath)
    }
    catch (err) {
        const destPath = path.join(app.getPath('userData'), 'temp-src')

        if (path.extname(app.getAppPath()).toLowerCase() !== ".asar") {
            console.log("Simkey path should exist as this is for testing. Add simkey dir in userData and retry.")
            return
        }

        asar.extractAll(app.getAppPath(), destPath)
        const tempSimkeyPath = path.join(destPath, "src", "simkey")
        await fs.move(tempSimkeyPath, path.dirname(simkeyPath))

        try {
            await installSimkeyDependencies()
            Compiler = require(simkeyPath)
        }
        catch (err) {
            dialog.showErrorBox("Installing dependencies failed", `Could not install depencies for Simkey. Delete your %appdata%/src directory and retry the installation.`)
        }

        await fs.remove(destPath)
    }

    try {
        await fs.access(RunKeyCExePath)
        await fs.access(RunKeyCPath)
    }
    catch (err) {
        const RunKeyCExe = asar.extractFile(app.getAppPath(), path.join("src", "resources", "RunKeyC.exe"))
        const RunKeyCC = asar.extractFile(app.getAppPath(), path.join("src", "resources", "RunKeyC.c"))
        await fs.writeFile(RunKeyCExePath, RunKeyCExe)
        await fs.writeFile(RunKeyCPath, RunKeyCC)
    }
})()


function installSimkeyDependencies() {
    return new Promise((resolve, reject) => {
        exec('npm install', { cwd: path.dirname(simkeyPath) }, (err, stdout, stderr) => {
            if (err) {
                reject("Could not install dependencies." + err)
                return
            }
            resolve(stdout)
        })
    })
}


let mainWindow
let utilWindow

let cursorListener

if (started) {
    app.quit()
}


const currentExecProcesses = {}

app.on('window-all-closed', () => {
    globalShortcut.unregisterAll()
    if (process.platform !== 'darwin') {
        app.quit()
    }
})


ipcMain.handle('load-new-script', async () => {
    const { canceled: cancelled, filePaths } = await dialog.showOpenDialog({
        title: "Select a Simkey File",
        properties: ["openFile"],
        filters: [
            { name: 'Simkey Files', extensions: ["simkey"] }
        ]
    })

    if (cancelled) {
        return false
    }

    const scripts = JSON.parse(await fs.readFile(scriptsPath, "utf-8"))

    if (scripts[filePaths[0]]) {
        dialog.showErrorBox("Script is Already Loaded", `The script located in ${filePaths[0]} is already loaded. To reload, click the reload button in the scripts menu.`)
        return false
    }

    try {
        const compileFile = new Compiler(filePaths[0])

        let title = filePaths[0].replaceAll("\\", "/")
        title = title.slice(title.lastIndexOf("/") + 1)

        const scriptInfo = {
            title,
            modeOptions: compileFile.getModes(),
            switchOptions: compileFile.getSwitches()
        }

        const { name, mode, switches, repeat, shortcut } = compileFile.getSettings()

        if (name.length > 1) scriptInfo.title = name
        scriptInfo.repeat = repeat
        scriptInfo.switches = switches
        scriptInfo.mode = mode
        scriptInfo.keyc = getKEYCName(scripts)
        scriptInfo.inputVectors = compileFile.getInputVectors()

        compileFile.setSettings(getSettingsObject(scriptInfo))
        compileFile.compile(path.join(keycFilesPath, scriptInfo.keyc))

        let setLater = false
        scriptInfo.shortcut = shortcut
        if (shortcut !== "NONE") {
            if (checkValidShortcut(shortcut) !== true) {
                scriptInfo.shortcut = "NONE"
                dialog.showErrorBox("An Error Occured", `Shortcut in the SETTINGS section of Simkey script is invalid or is already taken by another program or script. No shortcut has been set for this script.`)
            }
            else setLater = true
        }

        scripts[filePaths[0]] = scriptInfo
        await fs.writeFile(scriptsPath, JSON.stringify(scripts))

        if (setLater) {
            addShortcut(scriptInfo)
        }

        return [scriptInfo.title, filePaths[0]]
    }
    catch (err) {
        dialog.showErrorBox("An Error Occured", `Error while trying to load script in ${filePaths[0]} (it contains an error, or error occurred while loading the file).\n${err}`)
        return false
    }
})


ipcMain.handle('load-scripts', async () => {
    const scripts = JSON.parse(await fs.readFile(scriptsPath, "utf-8"))
    const scriptArray = []

    for (const script in scripts) {
        scriptArray.push([scripts[script].title, script])
    }

    return scriptArray
})


ipcMain.handle('reload-script', async (event, location) => {
    const scripts = JSON.parse(await fs.readFile(scriptsPath, "utf-8"))
    const script = scripts[location]

    try {
        const compileFile = new Compiler(location)

        script.switchOptions = compileFile.getSwitches()
        script.modeOptions = compileFile.getModes()

        script.switches = script.switches.filter(val => script.switchOptions.includes(val))
        if (!script.modeOptions.includes(script.mode)) script.mode = "$DEFAULT"

        const oldKeyC = script.keyc
        script.keyc = getKEYCName(scripts)
        compileFile.setSettings(getSettingsObject(script))

        const inputVectors = compileFile.getInputVectors()
        for (const inputVec in inputVectors) {
            if (!script.inputVectors[inputVec]) script.inputVectors[inputVec] = inputVectors[inputVec]
        }
        for (const inputVec in script.inputVectors) {
            if (!inputVectors[inputVec]) delete script.inputVectors[inputVec]
            else if (inputVectors[inputVec].length !== script.inputVectors[inputVec].length) script.inputVectors[inputVec] = inputVectors[inputVec]
        }
        
        compileFile.setInputVectors(script.inputVectors)
        compileFile.compile(path.join(keycFilesPath, script.keyc))

        if (script.shortcut !== "NONE") {
            globalShortcut.unregister(script.shortcut)
            addShortcut(script)
        }

        let title = location.replaceAll("\\", "/")
        title = title.slice(title.lastIndexOf("/") + 1)

        let settingsTitle = compileFile.getSettings().name

        if (settingsTitle !== "") {
            title = settingsTitle
        }

        script.title = title

        await fs.writeFile(scriptsPath, JSON.stringify(scripts))
        await fs.rm(path.join(keycFilesPath, oldKeyC))
        return title // return [true, title]
    }
    catch (err) {
        dialog.showErrorBox("Reloaded Script Error", `There was an error when reloading the script. This is most likely from a change that caused an error in your script, or an error from handling a file. The script has not been updated.\n${err}`)
        return false
    }
})


ipcMain.handle('save-script', async (event, location, options, forceRecompile = true) => {
    const scripts = JSON.parse(await fs.readFile(scriptsPath, "utf-8"))

    if (options.shortcut !== "NONE") {
        if (scripts?.[location]?.shortcut !== options.shortcut) {
            const check = checkValidShortcut(options.shortcut)
            if (check === 10) dialog.showErrorBox("Conflicting Shortcut", `The shortcut ${options.shortcut} is already in use. Choose another one.`)
            if (check === 20) dialog.showErrorBox("Invalid Shortcut", `The shortcut ${options.shortcut} might be invalid. Choose another one.`)
        }
    }

    if (isNaN(options.repeat) && options.repeat !== "OFF" && options.repeat !== "ON") {
        dialog.showErrorBox("Invalid Repeat Value", `${options.repeat} is an invalid repeat value. Choose a positive whole number, "OFF", or "ON".`)
        return false
    }
    if (!isNaN(options.repeat) && (Number(options.repeat) <= 0 || Number(options.repeat) % 1 > 0)) {
        dialog.showErrorBox("Invalid Repeat Value", `${options.repeat} is an invalid repeat value. Choose a positive whole number, "OFF", or "ON".`)
        return false
    }

    if (scripts?.[location]?.shortcut && scripts?.[location]?.shortcut !== "NONE") {
        globalShortcut.unregister(scripts[location].shortcut)
    }

    if (options.mode === scripts?.[location]?.mode && JSON.stringify(options.switches) === JSON.stringify(scripts?.[location]?.switches) && !forceRecompile) {
        scripts[location].shortcut = options.shortcut
        scripts[location].repeat = options.repeat
        addShortcut(scripts[location])

        await fs.writeFile(scriptsPath, JSON.stringify(scripts))
        return true
    }

    const originalScriptInfo = JSON.parse(JSON.stringify(scripts[location]))

    try {
        await fs.rm(path.join(keycFilesPath, scripts[location].keyc), { force: true })

        const compileFile = new Compiler(location)
        compileFile.setSettings(getSettingsObject(options))
        compileFile.setInputVectors(options.inputVectors)

        options.keyc = getKEYCName(scripts)
        compileFile.compile(path.join(keycFilesPath, options.keyc))

        scripts[location] = options
        await fs.writeFile(scriptsPath, JSON.stringify(scripts))

        addShortcut(options)
        return true
    }
    catch (err) {
        dialog.showErrorBox("An Error Occured", `Error while trying to load script in ${location} (it contains an error, or error while loading or writing to a file).\n${err}`)
        addShortcut(originalScriptInfo)
        return false
    }
})


ipcMain.handle('remove-script', async (event, location) => {
    const scripts = JSON.parse(await fs.readFile(scriptsPath, "utf-8"))

    for (const script in scripts) {
        if (script !== location) continue

        try {
            await fs.rm(path.join(keycFilesPath, scripts[script].keyc), { force: true })
            if (scripts[script].shortcut !== "NONE") globalShortcut.unregister(scripts[script].shortcut)

            delete scripts[script]
            await fs.writeFile(scriptsPath, JSON.stringify(scripts))

            return true
        }

        catch (err) {
            dialog.showErrorBox("An Error Occured", `The script located in "${script}" could not be removed.\n${err}`)
            return false
        }
    }
})


ipcMain.handle('open-script', async (event, location) => {
    shell.openPath(location)
})


ipcMain.handle('get-script-options', async (event, location) => {
    const scripts = JSON.parse(await fs.readFile(scriptsPath, "utf-8"))
    return scripts[location]
})


ipcMain.handle('run-stop-script', async (event, location) => {
    const scripts = JSON.parse(await fs.readFile(scriptsPath, "utf-8"))
    return terminateOrRun(scripts[location].keyc, scripts[location])
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


ipcMain.handle('send-message', async (event, message) => {
    dialog.showMessageBox({ message: message, buttons: ["OK"] })
})


function getKEYCName(scripts) {
    let keycName, noMatches = false
    while (!noMatches) {
        keycName = getRandomKEYCName()
        noMatches = true
        for (const script in scripts) {
            if (scripts[script].keyc === keycName) {
                noMatches = false
                break
            }
        }
    }
    return keycName
}

function getRandomKEYCName() {
    const randomChars = ['a', 'b', 'c', 'd', 'e', 'f', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    let name = ""
    for (let i = 0; i < 15; i++) {
        name += randomChars[Math.floor(Math.random() * (randomChars.length - 1))]
    }
    return name + ".keyc"
}


function getSettingsObject(scriptInfo) {
    const settings = {
        [scriptInfo.mode]: true
    }
    for (const switsh of scriptInfo.switches) {
        settings[switsh] = true
    }
    return settings
}


function spawnWithCommand(scriptInfo) {
    const exeFilepath = path.resolve(__dirname, RunKeyCExePath)
    const keycFilePath = path.join(keycFilesPath, scriptInfo.keyc)
    return spawn(exeFilepath, [keycFilePath, scriptInfo.repeat])
}


function addShortcut(scriptInfo) {
    if (scriptInfo.shortcut === "NONE") return
    globalShortcut.register(scriptInfo.shortcut, () => {
        terminateOrRun(scriptInfo.keyc, scriptInfo)
    })
}


function terminateOrRun(keycFileName, scriptInfo) {
    if (currentExecProcesses[keycFileName]) {
        currentExecProcesses[keycFileName].kill("SIGKILL")
        delete currentExecProcesses[keycFileName]
        mainWindow.webContents.send("run-message", 1)
    }
    else {
        currentExecProcesses[keycFileName] = spawnWithCommand(scriptInfo)
        mainWindow.webContents.send("run-message", 1)
        currentExecProcesses[keycFileName].on('exit', () => {
            delete currentExecProcesses[keycFileName]
            mainWindow.webContents.send("run-message", 0)
        })
    }
}


function checkValidShortcut(shortcut) {
    try {
        if (globalShortcut.isRegistered(shortcut)) {
            return 10
        }
    }
    catch (err) {
        return 20
    }
    globalShortcut.register(shortcut, () => { })
    if (!globalShortcut.isRegistered(shortcut)) {
        return 20
    }
    globalShortcut.unregister(shortcut)
    return true
}