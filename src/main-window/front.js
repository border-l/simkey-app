// Important config elements
const configPanel = document.getElementById("configure-container")
const configShortcut = document.getElementById("configure-shortcut")
const configRepeat = document.getElementById("configure-repeat")
const selectMode = document.getElementById("select-mode")
const selectSwitches = document.getElementById("select-switches")
const chosenSwitches = document.getElementById("chosen-switches")
const configScriptTitle = document.getElementById("script-title")
const configExit = document.getElementById("config-x")
const configInputVectors = document.getElementById("config-vectors")


// Option buttons and script menu
const scriptMenu = document.getElementById("script-menu")
const runButton = document.getElementById("run-button")
const saveButton = document.getElementById("save-button")
const loadButton = document.getElementById("load-button")
const utilsButton = document.getElementById("utils-button")


// Important components
const components = {
    chosenSwitch: (name) => {
        const container = document.createElement("div")
        container.classList.add("chosen-switch")
        container.id = `switch-${name}`

        const title = document.createElement("div")
        title.classList.add("chosen-switch-title")
        title.textContent = name

        const button = document.createElement("button")
        button.classList.add("chosen-switch-x")
        button.textContent = "✖"
        button.addEventListener("click", () => removeSwitch(name))

        container.appendChild(title)
        container.appendChild(button)

        return container
    },

    scriptItem: (title, location) => {
        const container = document.createElement("div")
        container.classList.add("script-item")
        container.id = `script-${location}`

        const topContainer = document.createElement("div")
        topContainer.classList.add("script-top-container")

        const titleLocationContainer = document.createElement("div")
        titleLocationContainer.classList.add("script-title-location-container")

        const titleDiv = document.createElement("div")
        titleDiv.id = `script-title-${location}`
        titleDiv.classList.add("script-title")
        titleDiv.textContent = title

        const locationDiv = document.createElement("div")
        locationDiv.classList.add("script-location")
        locationDiv.textContent = location

        titleLocationContainer.appendChild(titleDiv)
        titleLocationContainer.appendChild(locationDiv)

        const scriptReload = document.createElement("button")
        scriptReload.classList.add("script-reload")
        scriptReload.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="40px" height="40px" viewBox="0 0 120 120" id="reload-svg-${location}"><g><path d="M60,95.5c-19.575,0-35.5-15.926-35.5-35.5c0-19.575,15.925-35.5,35.5-35.5c13.62,0,25.467,7.714,31.418,19h22.627   C106.984,20.347,85.462,3.5,60,3.5C28.796,3.5,3.5,28.796,3.5,60c0,31.203,25.296,56.5,56.5,56.5   c16.264,0,30.911-6.882,41.221-17.88L85.889,84.255C79.406,91.168,70.201,95.5,60,95.5z"/></g><line x1="120" y1="0" x2="120" y2="45.336"/><line x1="91.418" y1="43.5" x2="114.045" y2="43.5"/><polygon points="120,21.832 119.992,68.842 74.827,55.811 "/></svg>`
        scriptReload.addEventListener("click", () => reloadScript(location))
        scriptReload.id = `script-reload-${location}`

        const optionsContainer = document.createElement("div")
        optionsContainer.classList.add("script-options")
        optionsContainer.id = `script-${location}-options`

        const selectButton = document.createElement("button")
        selectButton.classList.add("script-option")
        selectButton.textContent = "✨ Select"
        selectButton.id = `script-select-${location}`
        selectButton.addEventListener("click", () => configureScript(location))

        const openButton = document.createElement("button")
        openButton.classList.add("script-option")
        openButton.textContent = "📂 Open"
        openButton.addEventListener("click", () => openScript(location))

        const removeButton = document.createElement("button")
        removeButton.classList.add("script-option")
        removeButton.textContent = "🗑️ Remove"
        removeButton.addEventListener("click", () => removeScript(location))

        optionsContainer.appendChild(selectButton)
        optionsContainer.appendChild(openButton)
        optionsContainer.appendChild(removeButton)

        topContainer.appendChild(titleLocationContainer)
        topContainer.appendChild(scriptReload)

        container.appendChild(topContainer)
        container.appendChild(optionsContainer)

        return container
    },

    optionItem: (value, text) => {
        const option = document.createElement("option")
        option.id = `option-${value}`
        option.value = value
        option.textContent = text ? text : value
        return option
    },

    /* MAKE THIS LOOK BETTER */
    vectorInput: (name, value) => {
        const container = document.createElement("div")
        container.classList.add("configure-option")

        const title = document.createElement("div")
        title.classList.add("configure-option-title")
        title.textContent = name

        const input = document.createElement("input")
        input.classList.add("configure-option-input")
        input.value = value
        input.id = `vector-input-${name}`
        input.addEventListener('focusout', handleVectorInput.bind(null, name))

        container.appendChild(title)
        container.appendChild(input)

        return container
    }
}


// Load scripts from main
async function loadScripts() {
    const scripts = await window.electron.loadScripts()

    for (const script of scripts) {
        const scriptItem = components.scriptItem(script[0], script[1])
        scriptMenu.append(scriptItem)
    }
}
loadScripts()


// Event listeners
selectSwitches.addEventListener('change', handleSelectSwitchesChange)
selectMode.addEventListener('change', handleSelectModeChange)

configShortcut.addEventListener('focusout', handleShortcutInput)
configRepeat.addEventListener('focusout', handleRepeatInput)

configShortcut.addEventListener('keydown', (event) => {
    if (event.key === "Enter") handleShortcutInput()
})
configRepeat.addEventListener('keydown', (event) => {
    if (event.key === "Enter") handleRepeatInput()
})

runButton.addEventListener('click', handleRunButton)
saveButton.addEventListener('click', handleSaveButton)
loadButton.addEventListener('click', handleLoadButton)
utilsButton.addEventListener('click', handleUtilsButton)

configExit.addEventListener('click', () => setDisableConfig(true))


// Keep track of what is currently being configured
let currentConfigure = {}
let initialCurrentConfigure = {}


// Listen to scripts running and exiting
window.electron.runListener((event, message) => {
    message === 0 ? runButton.innerText = "🚀 Run" : runButton.innerText = "🛑 Stop"
})


// Functions for listeners to added on elements
async function reloadScript(location) {
    if (currentConfigure.location === location) {
        setDisableConfig(true)
    }

    const scriptReload = document.getElementById(`script-reload-${location}`)
    const reloadSVG = document.getElementById(`reload-svg-${location}`)

    reloadSVG.classList.add("reload-spin")
    scriptReload.disabled = true

    const result = await window.electron.reloadScript(location)
    setTimeout(() => {
        reloadSVG.classList.remove("reload-spin")
        scriptReload.disabled = false
        if (result !== false) {
            document.getElementById(`script-title-${location}`).innerText = result
        }
    }, 200)
}

function removeSwitch(name) {
    currentConfigure.switches = currentConfigure.switches.filter((val) => val !== name)
    document.getElementById(`switch-${name}`).remove()
    selectSwitches.append(components.optionItem(name))
}

async function openScript(location) {
    await window.electron.openScript(location)
}

async function configureScript(location) {
    if (currentConfigure.location && currentConfigure.location !== location) {
        toggleSelected(currentConfigure.location, false)
    }

    const currentOptions = await window.electron.getScriptOptions(location)

    setDisableConfig(true)
    setDisableConfig(false)
    setOptions(currentOptions.modeOptions, currentOptions.switchOptions.filter((val) => !currentOptions.switches.includes(val)))
    addSwitches(currentOptions.switches)
    handleLoadInputVectors(currentOptions.inputVectors)

    configScriptTitle.innerText = currentOptions.title

    if (currentOptions.shortcut !== "NONE") configShortcut.value = currentOptions.shortcut
    configRepeat.value = currentOptions.repeat
    selectMode.value = currentOptions.mode

    currentConfigure = currentOptions
    currentConfigure.location = location

    initialCurrentConfigure = JSON.parse(JSON.stringify(currentConfigure))

    toggleSelected(location, true)
}

async function removeScript(location) {
    window.electron.removeScript(location).then((success) => {
        if (success) {
            document.getElementById(`script-${location}`).remove()
            if (currentConfigure.location === location) {
                currentConfigure = {}
                initialCurrentConfigure = {}
                setDisableConfig(true)
            }
        }
    })
}


// Functions for event listeners up there
function handleSelectSwitchesChange() {
    const newSwitch = selectSwitches.value
    selectSwitches.value = ""

    if (newSwitch.value === "") {
        return
    }

    currentConfigure.switches.push(newSwitch)
    chosenSwitches.append(components.chosenSwitch(newSwitch))

    document.getElementById(`option-${newSwitch}`).remove()
}

function handleSelectModeChange() {
    currentConfigure.mode = selectMode.value
}

function handleShortcutInput() {
    let changed = false

    if (configShortcut.value === "" || configShortcut.value === "NONE") {
        if (currentConfigure.shortcut !== "NONE") {
            currentConfigure.shortcut = "NONE"
            changed = true
        }
        configShortcut.value = ""
    }
    else if (currentConfigure.shortcut !== configShortcut.value) {
        currentConfigure.shortcut = configShortcut.value
        changed = true
    }

    if (sameKeyValuePairs(currentConfigure, initialCurrentConfigure, "shortcut") && initialCurrentConfigure.shortcut !== configShortcut.value && changed) {
        handleSaveButton(false)
    }
}

function handleRepeatInput() {
    changed = false

    if (currentConfigure.repeat !== configRepeat.value) {
        currentConfigure.repeat = configRepeat.value
        changed = true
    }

    if (sameKeyValuePairs(currentConfigure, initialCurrentConfigure, "repeat") && changed && initialCurrentConfigure.repeat !== configRepeat.value) {
        handleSaveButton(false)
    }
}

async function handleLoadButton() {
    const newScript = await window.electron.loadNewScript()
    if (newScript === false) return

    const scriptItem = components.scriptItem(newScript[0], newScript[1])
    scriptMenu.append(scriptItem)
}

async function handleSaveButton(forceRecompile = true) {
    const { location, ...configuration } = currentConfigure

    saveButton.innerText = "💾 Saving"
    saveButton.innerHTML += ` <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="20px" height="20px" viewBox="0 0 120 120" class="reload-spin" id="save-button-reload"><g><path d="M60,95.5c-19.575,0-35.5-15.926-35.5-35.5c0-19.575,15.925-35.5,35.5-35.5c13.62,0,25.467,7.714,31.418,19h22.627   C106.984,20.347,85.462,3.5,60,3.5C28.796,3.5,3.5,28.796,3.5,60c0,31.203,25.296,56.5,56.5,56.5   c16.264,0,30.911-6.882,41.221-17.88L85.889,84.255C79.406,91.168,70.201,95.5,60,95.5z"/></g><line x1="120" y1="0" x2="120" y2="45.336"/><line x1="91.418" y1="43.5" x2="114.045" y2="43.5"/><polygon points="120,21.832 119.992,68.842 74.827,55.811 "/></svg>`
    saveButton.disabled = true

    const saved = await window.electron.saveScript(location, configuration, forceRecompile)
    if (!saved) {
        saveButton.innerHTML = "💾 Save"
        saveButton.disabled = false
        return
    }

    setTimeout(() => {
        saveButton.classList.add("option-button-on")
        saveButton.innerHTML = "💾 Saved"

        setTimeout(() => {
            saveButton.innerHTML = "💾 Save"
            saveButton.classList.remove("option-button-on")
            saveButton.disabled = false
        }, 750)
    }, 250)

    initialCurrentConfigure = JSON.parse(JSON.stringify(currentConfigure))
}

async function handleRunButton() {
    await window.electron.runStopScript(currentConfigure.location)
}


async function handleUtilsButton() {
    await window.electron.openUtils()
}


// Helper functions
function setDisableConfig(disable) {
    configShortcut.disabled = disable
    configRepeat.disabled = disable
    selectMode.disabled = disable
    selectSwitches.disabled = disable
    runButton.disabled = disable
    saveButton.disabled = disable
    configExit.disabled = disable

    if (!disable) {
        configPanel.classList.remove("opacity-low")
        runButton.classList.remove("opacity-low")
        saveButton.classList.remove("opacity-low")
    }
    else {
        configInputVectors.classList.add("hidden")
        configPanel.classList.add("opacity-low")
        runButton.classList.add("opacity-low")
        saveButton.classList.add("opacity-low")
        configShortcut.value = ""
        configRepeat.value = "OFF"
        setOptions(["$DEFAULT"], [])
        addSwitches([])
        handleLoadInputVectors({})
        currentConfigure.location ? toggleSelected(currentConfigure.location, false) : 0
        configScriptTitle.innerText = "No script selected"
        currentConfigure = {}
        initialCurrentConfigure = {}
    }
}

function setOptions(modeOptions, switchOptions) {
    selectMode.innerHTML = ""
    selectSwitches.innerHTML = ""

    selectSwitches.append(components.optionItem("", "Add switch"))
    selectSwitches.value = ""

    for (const mode of modeOptions) {
        selectMode.appendChild(components.optionItem(mode))
    }

    for (const switchOption of switchOptions) {
        selectSwitches.appendChild(components.optionItem(switchOption))
    }
}

function addSwitches(switches) {
    chosenSwitches.innerHTML = ""
    for (const switsh of switches) {
        const switchElement = components.chosenSwitch(switsh)
        chosenSwitches.append(switchElement)
    }
}

function handleLoadInputVectors(inputVectors) {
    if (Object.keys(inputVectors).length === 0) return
    configInputVectors.classList.remove("hidden")
    configInputVectors.innerHTML = ""

    for (const vector in inputVectors) {
        const vectorInput = components.vectorInput(vector, inputVectors[vector].join(", "))
        configInputVectors.append(vectorInput)
    }
}

async function handleVectorInput(name) {
    let value = document.getElementById(`vector-input-${name}`).value
    value = value.split(",").map(val => Number(val.trim()))

    if (value.some(val => isNaN(val))) {
        await window.electron.sendMessage("You inputted an invalid number. Try again.")
        return
    }

    const currentValue = currentConfigure.inputVectors[name]
    
    if (value.length !== currentValue.length) {
        await window.electron.sendMessage(`You must match the original length of the vector. Try again with ${currentValue.length} number(s).`)
    }

    currentConfigure.inputVectors[name] = value
}

function toggleSelected(location, selected) {
    const prevSelectButton = document.getElementById(`script-select-${location}`)
    prevSelectButton.innerText = selected ? "✨ Selected" : "✨ Select"
    selected ? prevSelectButton.classList.add("script-selected") : prevSelectButton.classList.remove("script-selected")
}

function sameKeyValuePairs(obj1, obj2, excludedKey) {
    for (const key in obj1) {
        if (!obj2[key]) return false
        if (key !== excludedKey && JSON.stringify(obj2[key]) !== JSON.stringify(obj1[key])) return false
    }
    return true
}