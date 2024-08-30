const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld('electron', {
  ping: () => ipcRenderer.invoke('ping'),
  save: (e, d) => ipcRenderer.invoke('save', d),
  sendHistoryData: (e, d) => ipcRenderer.invoke('sendHistoryData', d),
  hideZeroPlaces: (callback) => ipcRenderer.on('hideZeroPlaces', () => callback()),
  getTokenHistory: (callback) => ipcRenderer.on('getTokenHistory', () => callback()),
  load: async () => {var c = await ipcRenderer.invoke('load')
    return c
  },
})
