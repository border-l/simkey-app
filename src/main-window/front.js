// Important config elements
const configPanel = document.getElementById("configure-container")
const configShortcut = document.getElementById("configure-shortcut")
const configTitle = document.getElementById("configure-title")
const configVersion = document.getElementById("configure-version")
const configMode = document.getElementById("configure-mode")
const selectMode = document.getElementById("select-mode")
const configScriptTitle = document.getElementById("script-title")
const configExit = document.getElementById("config-x")
const configSwitchInputs = document.getElementById("config-switches")
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
    scriptItem: (title, version, location) => {
        const container = document.createElement("div")
        container.classList.add("script-item")
        container.id = `script-${location}`

        const topContainer = document.createElement("div")
        topContainer.classList.add("script-top-container")

        const titleLocationContainer = document.createElement("div")
        titleLocationContainer.classList.add("script-title-path-container")

        const titleDiv = document.createElement("div")
        titleDiv.id = `script-title-${location}`
        titleDiv.classList.add("script-title")
        titleDiv.textContent = title

        const locationDiv = document.createElement("div")
        locationDiv.classList.add("script-location")
        locationDiv.textContent = location

        titleLocationContainer.appendChild(titleDiv)
        titleLocationContainer.appendChild(locationDiv)

        const topRightContainer = document.createElement("div")
        topRightContainer.classList.add("script-top-right-container")

        const moveScriptContainer = document.createElement("div")
        moveScriptContainer.classList.add("script-move-container")

        const upButton = document.createElement("div")
        upButton.classList.add("script-move-button")
        upButton.innerText = "↑"
        upButton.addEventListener("click", () => moveScript(location, true))

        const downButton = document.createElement("div")
        downButton.classList.add("script-move-button")
        downButton.innerText = "↓"
        downButton.addEventListener("click", () => moveScript(location, false))

        moveScriptContainer.appendChild(upButton)
        moveScriptContainer.appendChild(downButton)

        const scriptVersion = document.createElement("div")
        scriptVersion.classList.add("script-version")
        scriptVersion.id = `script-version-${location}`
        scriptVersion.innerText = "v" + version

        topRightContainer.appendChild(moveScriptContainer)
        topRightContainer.appendChild(scriptVersion)

        const optionsContainer = document.createElement("div")
        optionsContainer.classList.add("script-options")
        optionsContainer.id = `script-options-${location}`

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
        topContainer.appendChild(topRightContainer)

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

    inputSwitch: (varName, name, desc, value) => {
        const container = document.createElement("div")
        container.classList.add("configure-option")

        const title = document.createElement("div")
        title.classList.add("configure-option-title", "rounded-right")
        title.textContent = name
        if (desc !== null) title.title = desc

        const switchContainer = document.createElement("div")
        switchContainer.classList.add("switch-container")

        const flipLabel = document.createElement("label")
        flipLabel.classList.add("switch")

        const switchInput = document.createElement("input")
        switchInput.type = "checkbox"
        switchInput.id = `input-${varName}`
        switchInput.addEventListener('change', handleSwitchInput.bind(null, varName))
        switchInput.checked = value

        const sliderSpan = document.createElement("span")
        sliderSpan.classList.add("slider")

        flipLabel.appendChild(switchInput)
        flipLabel.appendChild(sliderSpan)

        switchContainer.appendChild(flipLabel)

        container.appendChild(title)
        container.appendChild(switchContainer)

        return container
    },

    otherInput: (varName, name, desc, value) => {
        const container = document.createElement("div")
        container.classList.add("configure-option")

        const title = document.createElement("div")
        title.classList.add("configure-option-title")
        title.textContent = name
        if (desc !== null) title.title = desc

        const input = document.createElement("input")
        input.classList.add("configure-option-input")
        input.value = value
        input.id = `input-${varName}`
        input.addEventListener('focusout', handleOtherInput.bind(null, varName))

        container.appendChild(title)
        container.appendChild(input)

        return container
    }
}


// Keep track of what is currently being configured
let curConfig = {}
let curLocation = null
let initialConfig = {}
let running = {}
let order = []


// Load scripts from main
async function loadScripts() {
    const { scripts, order: ordr } = await window.electron.loadScripts()
    order = ordr

    console.log(order)
    for (const scriptPath of order) {
        const script = scripts[scriptPath]
        const scriptItem = components.scriptItem(script[0], script[1], script[2])
        scriptMenu.appendChild(scriptItem)
    }
}

loadScripts()


/*....... Event listeners .......*/

selectMode.addEventListener('change', handleSelectModeChange)

configShortcut.addEventListener('focusout', handleShortcutInput)
configTitle.addEventListener('focusout', handleTitleInput)
configVersion.addEventListener('focusout', handleVersionInput)

configShortcut.addEventListener('keydown', (event) => {
    if (event.key === "Enter") handleShortcutInput()
})

runButton.addEventListener('click', handleRunButton)
loadButton.addEventListener('click', handleLoadButton)
utilsButton.addEventListener('click', handleUtilsButton)

configExit.addEventListener('click', () => setDisableConfig(true))

modalClose.addEventListener('click', handleModalClose)


// Listen to scripts running and exiting
window.electron.runListener((event, message) => {
    running[message.path] = message.running
    if (curLocation === message.path) message.running ? runButton.innerText = "🛑 Stop" : runButton.innerText = "🚀 Run"
    if (message.error !== null) errorModal("Error while running script", `Path: ${message.path}. Error: \n${message.error}`)
})


/*....... Functions for listeners to add on elements .......*/

async function openScript(location) {
    await window.electron.openScript(location)
}


async function configureScript(location) {
    if (location === curLocation) {
        return
    }

    if (curLocation !== null) {
        toggleSelected(curLocation, false)
    }

    let tempConfig = await window.electron.getScriptOptions(location)

    if (tempConfig.err) {
        errorModal(tempConfig.errTitle, tempConfig.errMessage)
        return
    }

    setDisableConfig(true)
    setDisableConfig(false)

    curConfig = tempConfig.loaded
    curLocation = location

    loadModes()
    loadSwitches()
    loadOtherInputs()

    configTitle.value = curConfig.TITLE
    configVersion.value = curConfig.VERSION
    configScriptTitle.innerText = curConfig.TITLE

    if (curConfig.SHORTCUT !== null) configShortcut.value = curConfig.SHORTCUT
    else configShortcut.value = ""

    selectMode.value = Object.keys(curConfig.inputValues).find(val => curConfig.validInputs.MODES.includes(val) && curConfig.inputValues[val] === true) || ""

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
        curLocation = null
        setDisableConfig(true)
    }
}


async function moveScript(path, up) {
    const scriptElements = Array.from(scriptMenu.getElementsByClassName("script-item"))

    const index = order.indexOf(path)
    if ((index === order.length - 1 && !up) || (index === 0 && up)) return

    if (up) {
        const tempElement = scriptElements[index - 1]
        scriptElements[index - 1] = scriptElements[index]
        scriptElements[index] = tempElement

        const tempOrder = order[index - 1]
        order[index - 1] = order[index]
        order[index] = tempOrder
    }
    else {
        const tempElement = scriptElements[index + 1]
        scriptElements[index + 1] = scriptElements[index]
        scriptElements[index] = tempElement

        const tempOrder = order[index + 1]
        order[index + 1] = order[index]
        order[index] = tempOrder
    }

    scriptMenu.replaceChildren(scriptMenu.children[0], ...scriptElements)
    await window.electron.saveScriptOrder(order)
}


/*....... Functions for event listeners up there .......*/

async function handleOtherInput(varName) {
    const type = getType(varName, curConfig.validInputs)
    const formatted = formatInput(document.getElementById(`input-${varName}`).value, type)

    curConfig.inputValues[varName] = formatted
    await saveConfig()
}


async function handleSwitchInput(varName) {
    curConfig.inputValues[varName] = document.getElementById(`input-${varName}`).checked
    await saveConfig()
}


async function handleSelectModeChange() {
    curConfig.validInputs.MODES.forEach(val => curConfig.inputValues[val] = false)
    curConfig.inputValues[selectMode.value] = true

    const description = curConfig.validInputs.META[selectMode.value]?.description
    if (description !== undefined) selectMode.title = description

    await saveConfig()
}


async function handleShortcutInput() {
    let changed = false

    if (configShortcut.value === "" && curConfig.SHORTCUT !== null) {
        curConfig.SHORTCUT = null
        changed = true
    }

    else if (curConfig.SHORTCUT !== configShortcut.value && !(configShortcut.value === "" && curConfig.SHORTCUT === null)) {
        curConfig.SHORTCUT = configShortcut.value
        changed = true
    }

    if (changed) {
        await saveConfig()
    }
}


async function handleTitleInput() {
    if (configTitle.value !== curConfig.TITLE) {
        curConfig.TITLE = configTitle.value
        await saveConfig()
    }
}


async function handleVersionInput() {
    if (configVersion.value !== curConfig.VERSION) {
        curConfig.VERSION = configVersion.value
        await saveConfig()
    }
}


async function handleLoadButton() {
    const newScript = await window.electron.loadNewScript()
    if (newScript.err) errorModal(newScript.errTitle, newScript.errMessage)
    if (!newScript.loaded) return

    const scriptItem = components.scriptItem(newScript.loaded.TITLE, newScript.loaded.VERSION, newScript.loaded.PATH)
    scriptMenu.appendChild(scriptItem)
}


async function saveConfig() {
    const response = await window.electron.saveScript(curLocation, curConfig)

    if (response.reload) {
        alertToast("Script's inputs changed; config reloaded.")
        setDisableConfig(true)
    }

    else if (!response.saved) {
        if (!response.errTitle) alertToast("Invalid configuration!")
        else errorModal(response.errTitle, response.errMessage)
        curConfig = JSON.parse(JSON.stringify(initialConfig))
    }

    else {
        configScriptTitle.innerText = curConfig.TITLE
        document.getElementById(`script-title-${curLocation}`).innerText = curConfig.TITLE
        document.getElementById(`script-version-${curLocation}`).innerText = "v" + curConfig.VERSION
        saveToast()
    }
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
    configMode.classList.add("hidden")
    configShortcut.disabled = disable
    configTitle.disabled = disable
    configVersion.disabled = disable
    selectMode.disabled = disable
    runButton.disabled = disable
    configExit.disabled = disable

    if (!disable) {
        configPanel.classList.remove("opacity-low")
        runButton.classList.remove("opacity-low")
        if (running[curLocation]) runButton.innerText = "🛑 Stop"
        else runButton.innerText = "🚀 Run"
    }
    else {
        runButton.innerText = "🚀 Run"
        configOtherInputs.innerHTML = ""
        configOtherInputs.classList.add("hidden")
        configSwitchInputs.innerHTML = ""
        configSwitchInputs.classList.add("hidden")
        configPanel.classList.add("opacity-low")
        runButton.classList.add("opacity-low")
        configShortcut.value = ""
        configTitle.value = ""
        configVersion.value = ""
        curLocation ? toggleSelected(curLocation, false) : 0
        configScriptTitle.innerText = "No script selected"
        curConfig = {}
        curLocation = null
        initialConfig = {}
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
            background: "linear-gradient(to right, rgb(67, 194, 62),rgb(118, 192, 89))",
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
    if (inputs.NUMBERS[name] !== undefined) return "NUMBER"
    if (inputs.VECTORS[name] !== undefined) return "VECTOR"
    return null
}


function formatInput(string, type) {
    if (type === "VECTOR") return string.split(",").map(val => Number(val.trim()))
    if (type === "STRING") return escapeString(string)
    if (type === "NUMBER") return Number(string)
    return null
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


function loadModes() {
    selectMode.innerHTML = ""

    if (curConfig.validInputs.MODES.length === 0) {
        configMode.classList.add("hidden")
        return selectMode
    }
    configMode.classList.remove("hidden")

    for (const mode of curConfig.validInputs.MODES) {
        const optionItem = components.optionItem(mode, curConfig.validInputs.META[mode]?.name)
        selectMode.appendChild(optionItem)
    }

    selectMode.value = curConfig.validInputs.MODES.find(x => curConfig.inputValues[x])
    const description = curConfig.validInputs.META[selectMode.value]?.description
    if (description !== undefined) selectMode.title = description
}


function loadSwitches() {
    if (curConfig.validInputs.SWITCHES.length === 0) return
    configSwitchInputs.classList.remove("hidden")

    for (const switchInput of curConfig.validInputs.SWITCHES) {
        const inputElement = components.inputSwitch(
            switchInput,
            curConfig.validInputs.META[switchInput]?.name || switchInput,
            curConfig.validInputs.META[switchInput]?.description || null,
            curConfig.inputValues[switchInput])
        configSwitchInputs.appendChild(inputElement)
    }
}


function loadOtherInputs() {
    const otherInputs = [...Object.keys(curConfig.validInputs.NUMBERS), ...Object.keys(curConfig.validInputs.VECTORS), ...curConfig.validInputs.STRINGS]
    if (otherInputs.length === 0) return

    configOtherInputs.classList.remove("hidden")

    for (const input of otherInputs) {
        const inputElement = components.otherInput(
            input,
            curConfig.validInputs.META[input]?.name || input,
            curConfig.validInputs.META[input]?.description || null,
            String(curConfig.inputValues[input]))
        configOtherInputs.appendChild(inputElement)
    }
}


function toggleSelected(location, selected) {
    const prevSelectButton = document.getElementById(`script-select-${location}`)
    prevSelectButton.innerText = selected ? "✨ Selected" : "✨ Select"
    selected ? prevSelectButton.classList.add("script-selected") : prevSelectButton.classList.remove("script-selected")
}