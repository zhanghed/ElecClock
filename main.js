const { app, BrowserWindow, ipcMain, dialog, Menu, Tray, nativeImage, shell } = require('electron')
const path = require('path')
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true //临时屏蔽警告

const createMainWindow = () => {
  const win = new BrowserWindow({
    show: false,
    width: 250,
    height: 80,
    x: 0,
    y: 0,
    icon: path.resolve(__dirname, 'images/icon.ico'),
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    resizable: false,
    webPreferences: {
      preload: path.resolve(__dirname, 'preload.js'),
    },
  })
  win.loadFile(path.resolve(__dirname, 'index/index.html'), () => {})
  win.on('ready-to-show', () => {
    win.show()
    win.setSkipTaskbar(true)
    // win.center()
    // win.webContents.openDevTools()
  })
}

const createSetWindow = () => {
  const win = new BrowserWindow({
    show: false,
    width: 800,
    height: 600,
    x: 0,
    y: 0,
    title: 'ElecClock 设置',
    icon: path.resolve(__dirname, 'images/icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.resolve(__dirname, 'preload.js'),
    },
  })

  win.loadFile(path.resolve(__dirname, 'set/set.html'), () => {})

  win.on('ready-to-show', () => {
    win.show()
    // win.center()
    win.webContents.openDevTools()
  })
}

app.whenReady().then(() => {
  createMainWindow()

  // handle 监听器
  ipcMain.handle('dialog:openFile', async (event, title) => {
    const webContents = event.sender //发送方的 BrowserWindow 实例（窗口实例）
    const win = BrowserWindow.fromWebContents(webContents) // BrowserWindow 实例（窗口实例）的上下文
    win.setTitle(title) // 修改窗口标题
    const { canceled, filePaths } = await dialog.showOpenDialog() //获取选择的文件路径
    if (!canceled) {
      return filePaths[0]
    }
  })

  const tray = new Tray(nativeImage.createFromPath(path.resolve(__dirname, 'images/icon.png')))
  tray.setToolTip('ElecClock v1.0.0.0')
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: '关于  ',
        click: async () => {
          await shell.openExternal('https://gitee.com/zhanghed/ElecClock')
        },
      },
      {
        label: '设置  ',
        click: () => {
          createSetWindow()
        },
      },
      {
        label: '退出  ',
        click: () => {
          app.quit()
        },
      },
    ]),
  )

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
