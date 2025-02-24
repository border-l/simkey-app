// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
    startCursorListening: (switchOn) => ipcRenderer.invoke("listen-cursor", switchOn),
	attachCursorListener: (callback) => ipcRenderer.on("cursor-update", callback)
})