const cursorButton = document.getElementById("cursor-button")

cursorButton.addEventListener('click', handleCursorButton)

window.electron.attachCursorListener(handleCursorChange)

async function handleCursorButton() {
    window.electron.startCursorListening(true)
}

function handleCursorChange(event, newCoordinates) {
    const { x, y } = newCoordinates
    cursorButton.innerText = `🖱️ Cursor — (${x}, ${y})`
}