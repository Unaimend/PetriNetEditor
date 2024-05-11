const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld('electron', {
  ping: () => ipcRenderer.invoke('ping'),
  save: (e, d) => ipcRenderer.invoke('save', d),
  load: async () => {var c = await ipcRenderer.invoke('load')
    return c
  },
})
