const { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage, shell, screen } = require('electron')
const path = require('path')
const fs = require('fs')

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true //临时屏蔽警告

let packageC, configC, workWidth

const appInit = () => {
  // 初始化 获取两个配置文件
  return new Promise((resolve, reject) => {
    // let packageC, configC, workWidth
    fs.readFile(path.resolve(__dirname, 'package.json'), 'utf8', (err, data) => {
      if (err) reject(err)
      packageC = JSON.parse(data)
      fs.readFile(path.resolve(__dirname, 'config.json'), 'utf8', (err1, data1) => {
        if (err1) reject(err1)
        configC = JSON.parse(data1)
        workWidth = screen.getPrimaryDisplay().workAreaSize.width
        // resolve([packageC, configC, workWidth])
        resolve()
      })
    })
  })
}

const createMainWindow = () => {
  // 创建主窗体 时钟
  const win = new BrowserWindow({
    show: false,
    width: parseInt(workWidth * (configC.size / 10)),
    height: parseInt((workWidth * (configC.size / 10)) / 3),
    x: configC.position[0],
    y: configC.position[1],
    icon: path.resolve(__dirname, 'images/icon.ico'),
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.resolve(__dirname, 'preload.js'),
    },
  })
  win.loadFile(path.resolve(__dirname, 'index/index.html'), () => {})
  win.on('moved', () => {
    // 监听窗体移动位置
    configC.position = win.getPosition()
    win.setPosition(...configC.position)
    fs.writeFile(path.resolve(__dirname, 'config.json'), JSON.stringify(configC), (err) => {})
  })
  ipcMain.on('set-size', async (event, value) => {
    // 监听设置窗体大小
    configC.size = value
    win.setMinimumSize(0, 0)
    win.setSize(parseInt(workWidth * (configC.size / 10)), parseInt((workWidth * (configC.size / 10)) / 3))
    fs.writeFile(path.resolve(__dirname, 'config.json'), JSON.stringify(configC), (err) => {})
  })
  ipcMain.on('set-color', async (event, value) => {
    // 监听设置字体颜色
    configC.color = value
    fs.writeFile(path.resolve(__dirname, 'config.json'), JSON.stringify(configC), (err) => {})
    win.webContents.send('hand-config', configC)
  })
  win.on('ready-to-show', () => {
    win.show()
    win.webContents.send('hand-config', configC)
  })
}

const createSetWindow = () => {
  // 创建设置窗体
  const win = new BrowserWindow({
    show: false,
    width: 800,
    height: 600,
    x: 0,
    y: 0,
    title: '设置',
    alwaysOnTop: true,
    icon: path.resolve(__dirname, 'images/icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.resolve(__dirname, 'preload.js'),
    },
  })
  win.loadFile(path.resolve(__dirname, 'set/set.html'), () => {})
  win.on('ready-to-show', () => {
    win.show()
    win.center()
    win.webContents.send('hand-config', configC)
    win.webContents.openDevTools()
  })
  return win
}

const createMenu = () => {
  // 创建托盘菜单
  const tray = new Tray(nativeImage.createFromPath(path.resolve(__dirname, 'images/icon.png')))
  tray.setToolTip(`${packageC.name} ${packageC.version}`)
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: '关于  ',
        click: async () => {
          await shell.openExternal(packageC.description)
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
}

app.whenReady().then(async () => {
  await appInit()
  createMainWindow()
  createMenu()

  ipcMain.on('set-openAtLogin', async (event, value) => {
    // 监听设置开机启动
    configC.openAtLogin = value
    fs.writeFile(path.resolve(__dirname, 'config.json'), JSON.stringify(configC), (err) => {})
    app.setLoginItemSettings({
      openAtLogin: configC.openAtLogin,
    })
  })
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
