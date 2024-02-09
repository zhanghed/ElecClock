const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  setColor: (value) => ipcRenderer.send('set-color', value),

  handConfig: (callback) => ipcRenderer.on('hand-config', callback),
})
