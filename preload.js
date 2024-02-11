const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  // 渲染进程向主进程
  setColor: (value) => ipcRenderer.send('set-color', value),
  setSize: (value) => ipcRenderer.send('set-size', value),
  setOpenAtLogin: (value) => ipcRenderer.send('set-openAtLogin', value),
  // 主进程向渲染进程
  handConfig: (callback) => ipcRenderer.on('hand-config', callback),
})
