// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

// Expose ipcRenderer to the renderer process
contextBridge.exposeInMainWorld('electron', {
	loadNewScript: () => ipcRenderer.invoke("load-new-script"),
    loadScripts: () => ipcRenderer.invoke("load-scripts"),
    reloadScript: (location) => ipcRenderer.invoke("reload-script", location),
    saveScript: (location, options, forceRecompile) => ipcRenderer.invoke("save-script", location, options, forceRecompile),
    getScriptOptions: (location) => ipcRenderer.invoke("get-script-options", location),
    removeScript: (location) => ipcRenderer.invoke("remove-script", location),
    openScript: (location) => ipcRenderer.invoke("open-script", location),
    runStopScript: (location) => ipcRenderer.invoke("run-stop-script", location),
    runListener: (callback) => ipcRenderer.on('run-message', callback),
    openUtils: () => ipcRenderer.invoke("open-utilities-window")
})