const { app, BrowserWindow, ipcMain, dialog, Menu, Tray, nativeImage, shell } = require('electron')
const path = require('path')
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true //临时屏蔽警告

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    show: false, // 隐藏窗口
    width: 500,
    height: 1000,
    // width: 250,
    // height: 80,
    x: 0,
    y: 0,
    icon: path.resolve(__dirname, 'images/icon.ico'),
    // frame: false, // 菜单栏
    // alwaysOnTop: true, // 置顶
    // transparent: true, // 透明
    // resizable: false, // 更改窗口大小
    webPreferences: {
      preload: path.resolve(__dirname, 'preload.js'),
    },
  })

  mainWindow.loadFile(path.resolve(__dirname, 'index/index.html'), () => {})

  mainWindow.on('ready-to-show', () => {
    // 优化启动白屏 初始化后再显示
    mainWindow.show() //显示窗口
    mainWindow.setSkipTaskbar(true) //隐藏任务窗口
    // mainWindow.center() //居中
    mainWindow.webContents.openDevTools() //打开调试
  })
}

app.whenReady().then(() => {
  createWindow() //创建窗口

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

  let tray = null
  const icon = nativeImage.createFromPath(path.resolve(__dirname, 'images/icon.png'))
  tray = new Tray(icon)
  tray.setToolTip('This is my application')
  const contextMenu = Menu.buildFromTemplate([
    {
      role: 'Item2',
      label: '设置',
      click: async () => {
        await shell.openExternal('https://gitee.com/zhanghed/elec-tron')
      },
    },
    {
      role: 'Item1',
      label: '关于',
      click: async () => {
        await shell.openExternal('https://gitee.com/zhanghed/elec-tron')
      },
    },
  ])
  tray.setContextMenu(contextMenu)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow() // 苹果系统 唤醒应用 创建窗口
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit() // 非苹果系统 可以退出
})
