// Important config elements
const configPanel = document.getElementById("configure-container")
const configShortcut = document.getElementById("configure-shortcut")
const configRepeat = document.getElementById("configure-repeat")
const selectMode = document.getElementById("select-mode")
const selectSwitches = document.getElementById("select-switches")
const chosenSwitches = document.getElementById("chosen-switches")
const configScriptTitle = document.getElementById("script-title")
const configExit = document.getElementById("config-x")
const configOtherInputs = document.getElementById("config-others")


// Option buttons and script menu
const scriptMenu = document.getElementById("script-menu")
const runButton = document.getElementById("run-button")
const saveButton = document.getElementById("save-button")
const loadButton = document.getElementById("load-button")
const utilsButton = document.getElementById("utils-button")


// Important modal elements
const modalLayer = document.getElementById("modal-layer")
const modalTitle = document.getElementById("modal-title")
const modalText = document.getElementById("modal-text")
const modalClose = document.getElementById("modal-close")


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
    otherInput: (name, value) => {
        const container = document.createElement("div")
        container.classList.add("configure-option")

        const title = document.createElement("div")
        title.classList.add("configure-option-title")
        title.textContent = name

        const input = document.createElement("input")
        input.classList.add("configure-option-input")
        input.value = value
        input.id = `input-${name}`
        input.addEventListener('focusout', handleOtherInput.bind(null, name))

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


/*....... Event listeners .......*/

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
loadButton.addEventListener('click', handleLoadButton)
utilsButton.addEventListener('click', handleUtilsButton)

configExit.addEventListener('click', () => setDisableConfig(true))

modalClose.addEventListener('click', handleModalClose)


// Keep track of what is currently being configured
let curConfig = {}
let curLocation = null
let initialConfig = {}
let running = {}


// Listen to scripts running and exiting
window.electron.runListener((event, message) => {
    running[message.path] = message.running
    if (curLocation === message.path) message.running ? runButton.innerText = "🛑 Stop" : runButton.innerText = "🚀 Run"
    if (message.error !== null) errorModal("Error while running script", `Path: ${message.path}. Error: \n${message.error}`)
})


/*....... Functions for listeners to add on elements .......*/

function removeSwitch(name) {
    curConfig.inputValues[name] = false
    document.getElementById(`switch-${name}`).remove()
    selectSwitches.append(components.optionItem(name))
}


async function openScript(location) {
    await window.electron.openScript(location)
}


async function configureScript(location) {
    if (curLocation !== location && curLocation !== null) {
        toggleSelected(curLocation, false)
    }

    const currentOptions = await window.electron.getScriptOptions(location)

    setDisableConfig(true)
    setDisableConfig(false)
    setOptions(currentOptions.validInputs.MODES, currentOptions.validInputs.SWITCHES.filter((val) => !currentOptions.inputValues[val] === true))
    addSwitches(currentOptions.validInputs.SWITCHES)
    loadOtherInputs([...currentOptions.validInputs.NUMBERS,
    ...Object.keys(currentOptions.validInputs.VECTORS),
    ...currentOptions.validInputs.STRINGS])

    configScriptTitle.innerText = currentOptions.TITLE

    if (currentOptions.SHORTCUT !== null) configShortcut.value = currentOptions.SHORTCUT
    else configShortcut.value = ""

    configRepeat.value = currentOptions.REPEAT
    selectMode.value = Object.keys(currentOptions.inputValues).find(val => currentOptions.validInputs.MODES.includes(val) && currentOptions.inputValues[val] === true) || ""

    curConfig = currentOptions
    curLocation = location

    initialConfig = JSON.parse(JSON.stringify(curConfig))

    toggleSelected(location, true)
}


async function removeScript(location) {
    const success = await window.electron.removeScript(location)
    if (!success) return

    document.getElementById(`script-${location}`).remove()
    if (curLocation === location) {
        curConfig = {}
        initialConfig = {}
        setDisableConfig(true)
    }
}


/*....... Functions for event listeners up there .......*/

async function handleOtherInput(name) {
    const type = getType(name, curConfig.validInputs)
    const formatted = formatInput(document.getElementById(`input-${name}`), type)

    if (checkValid(formatted, type)) {
        await window.electron.sendMessage(`Your input for ${name} of type ${type} was not valid. Try again.`)
        return
    }

    curConfig.inputValues[name] = value
    await saveConfig()
}


async function handleSelectSwitchesChange() {
    const newSwitch = selectSwitches.value
    selectSwitches.value = ""

    if (newSwitch.value === "") {
        return
    }

    curConfig.inputValues[newSwitch] = false
    chosenSwitches.append(components.chosenSwitch(newSwitch))
    document.getElementById(`option-${newSwitch}`).remove()

    await saveConfig()
}


async function handleSelectModeChange() {
    curConfig.validInputs.MODES.forEach(val => curConfig.inputValues[val] = false)
    curConfig.inputValues[selectMode.value] = true
    await saveConfig()
}


async function handleShortcutInput() {
    let changed = false

    if (configShortcut.value === "" && curConfig.SHORTCUT !== null) {
        curConfig.SHORTCUT = null
        changed = true
    }

    else if (curConfig.SHORTCUT !== configShortcut.value) {
        curConfig.SHORTCUT = configShortcut.value
        changed = true
    }

    if (changed) {
        await saveConfig()
    }
}


async function handleRepeatInput() {
    changed = false

    if (curConfig.REPEAT !== configRepeat.value) {
        curConfig.REPEAT = configRepeat.value
        changed = true
    }

    if (changed) {
        await saveConfig()
    }
}


async function handleLoadButton() {
    const newScript = await window.electron.loadNewScript()
    if (newScript === false) return

    const scriptItem = components.scriptItem(newScript[0], newScript[1])
    scriptMenu.append(scriptItem)
}


async function saveConfig() {
    const saved = await window.electron.saveScript(curLocation, curConfig)

    if (saved === "RELOAD") {
        alertToast(`Script's inputs changed; config reloaded.`)
        setDisableConfig(true)
    }

    else if (!saved) {
        alertToast(`Invalid configuration!`)
        curConfig = JSON.parse(JSON.stringify(initialConfig))

    }

    else saveToast()
}


async function handleRunButton() {
    await window.electron.runStopScript(curLocation)
}


async function handleUtilsButton() {
    await window.electron.openUtils()
}


function handleModalClose() {
    modalLayer.classList.add("hidden")
}


/*....... Helper functions .......*/

function setDisableConfig(disable) {
    configShortcut.disabled = disable
    configRepeat.disabled = disable
    selectMode.disabled = disable
    selectSwitches.disabled = disable
    runButton.disabled = disable
    // saveButton.disabled = disable
    configExit.disabled = disable

    if (!disable) {
        configPanel.classList.remove("opacity-low")
        runButton.classList.remove("opacity-low")
        if (running[curLocation]) runButton.innerText = "🛑 Stop"
        else runButton.innerText = "🚀 Run"
    }
    else {
        runButton.innerText = "🚀 Run"
        configOtherInputs.classList.add("hidden")
        configPanel.classList.add("opacity-low")
        runButton.classList.add("opacity-low")
        configShortcut.value = ""
        configRepeat.value = "OFF"
        setOptions(["$DEFAULT"], [])
        addSwitches([])
        loadOtherInputs([])
        curLocation ? toggleSelected(curLocation, false) : 0
        configScriptTitle.innerText = "No script selected"
        curConfig = {}
        curLocation = null
        initialConfig = {}
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


function errorModal(title, message) {
    modalLayer.classList.remove("hidden")
    modalTitle.innerText = title
    modalText.innerText = message
}


function saveToast() {
    Toastify({
        text: "Saved!",
        duration: 1000,
        close: false,
        style: {
            background: "linear-gradient(to right rgb(67, 194, 62)416c,rgb(118, 255, 64))",
            color: "#fff",
            borderRadius: "10px",
            padding: "15px",
            fontWeight: "bold"
        }
    }).showToast()
}


function alertToast(message) {
    Toastify({
        text: message,
        duration: 2000,
        style: {
            background: "linear-gradient(to right, #ff416c, #ff4b2b)",
            color: "#fff",
            borderRadius: "10px",
            padding: "15px",
            fontWeight: "bold"
        }
    }).showToast();
}


/*....... Type/Validation .......*/

function getType(name, inputs) {
    if (inputs.MODES.includes(name)) return "MODE"
    if (inputs.SWITCHES.includes(name)) return "SWITCH"
    if (inputs.STRINGS.includes(name)) return "STRING"
    if (inputs.NUMBERS.includes(name)) return "NUMBER"
    if (inputs.VECTORS[name] !== undefined) return "VECTOR"
    return null
}


function formatInput(string, type) {
    if (type === "VECTOR") return string.split(",").map(val => Number(val.trim()))
    if (type === "STRING") return escapeString(string)
    if (type === "NUMBER") return Number(string)
    return null
}


function checkValid(value, type) {
    if (type === "VECTOR") return !value.some(val => isNaN(val) || typeof val !== "number")
    if (type === "STRING") return typeof value === "string"
    if (type === "NUMBER") return !isNaN(value) && typeof value === "number"
}


function escapeString(string) {
    let final = ""
    const special = {
        "n": "\n",
        "t": "\t",
        "r": "\r"
    }

    for (let i = 0; i < string.length; i++) {
        if (string[i] !== "\\") {
            final += special[string[i + 1]] || string[i + 1]
            continue
        }

        if (string.length === i + 1) return NaN
        final += string[i + 1]
        i += 1
    }

    return final
}


function loadOtherInputs(otherInputs) {
    if (otherInputs.length === 0) return
    configOtherInputs.classList.remove("hidden")
    configOtherInputs.innerHTML = ""

    for (const input of otherInputs) {
        const inputElement = components.otherInput(input, String(curConfig.inputValues[input]))
        configOtherInputs.append(inputElement)
    }
}


function toggleSelected(location, selected) {
    const prevSelectButton = document.getElementById(`script-select-${location}`)
    prevSelectButton.innerText = selected ? "✨ Selected" : "✨ Select"
    selected ? prevSelectButton.classList.add("script-selected") : prevSelectButton.classList.remove("script-selected")
}