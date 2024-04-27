const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld('electron', {
  ping: () => ipcRenderer.invoke('ping'),
  require: (s) => window.require(s),
  //dt: () => ipcRenderer.invoke('d3')
})
