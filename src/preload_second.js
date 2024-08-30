const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: (callback, d) => ipcRenderer.on('ipcRenderer', (event, data) => callback(data)),
})
