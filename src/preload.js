const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld('electron', {
  ping: () => ipcRenderer.invoke('ping'),
  save: (e, d) => ipcRenderer.invoke('save', d),
  hideZeroPlaces: (callback) => ipcRenderer.on('hideZeroPlaces', () => callback()),
  load: async () => {var c = await ipcRenderer.invoke('load')
    return c
  },
})
