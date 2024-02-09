const { contextBridge, ipcRenderer } = require('electron/renderer')

// 暴露通道
contextBridge.exposeInMainWorld('electronAPI', {
  // invoke 触发器
  openFile: (title) => ipcRenderer.invoke('dialog:openFile', title),
})
