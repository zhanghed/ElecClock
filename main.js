const { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage, shell, screen } = require('electron')
const path = require('path')
const fs = require('fs')

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true //临时屏蔽警告

let packageC, configC, wWidth

const appInit = () => {
  // 初始化 获取两个配置文件
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(__dirname, 'package.json'), 'utf8', (err, data) => {
      if (err) reject(err)
      packageC = JSON.parse(data)
      fs.readFile(path.resolve(__dirname, 'config.json'), 'utf8', (err1, data1) => {
        if (err1) reject(err1)
        configC = JSON.parse(data1)
        wWidth = screen.getPrimaryDisplay().workAreaSize.width
        resolve()
      })
    })
  })
}

const workSize = (win) => {
  // 计算尺寸
  win.setMinimumSize(0, 0)
  if (configC.format) {
    return [parseInt((wWidth * configC.size) / 2 / 10), parseInt((wWidth * configC.size) / 2 / 10 / 5)]
  } else {
    return [parseInt(((wWidth * configC.size) / 2 / 10) * 0.6), parseInt((wWidth * configC.size) / 2 / 10 / 5)]
  }
}

const createMainWindow = () => {
  // 创建主窗体 时钟
  const win = new BrowserWindow({
    show: false,
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
    win.setSize(...workSize(win))
    fs.writeFile(path.resolve(__dirname, 'config.json'), JSON.stringify(configC), (err) => {})
  })
  ipcMain.on('set-color', async (event, value) => {
    // 监听设置字体颜色
    configC.color = value
    fs.writeFile(path.resolve(__dirname, 'config.json'), JSON.stringify(configC), (err) => {})
    win.webContents.send('hand-config', configC)
  })
  ipcMain.on('set-format', async (event, value) => {
    // 监听设置显示秒位
    configC.format = value
    fs.writeFile(path.resolve(__dirname, 'config.json'), JSON.stringify(configC), (err) => {})
    win.setSize(...workSize(win))
    win.webContents.send('hand-config', configC)
  })
  win.on('ready-to-show', () => {
    win.show()
    win.setSize(...workSize(win))
    win.setPosition(...configC.position)
    win.webContents.send('hand-config', configC)
  })
}

const createSetWindow = () => {
  // 创建设置窗体
  const win = new BrowserWindow({
    show: false,
    width: 600,
    height: 400,
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
  })
}

const createRemindWindow = () => {
  // 创建提醒窗体
  const win = new BrowserWindow({
    show: false,
    width: 300,
    height: 150,
    title: '提醒',
    alwaysOnTop: true,
    autoHideMenuBar: true,
    icon: path.resolve(__dirname, 'images/icon.ico'),
    webPreferences: {
      preload: path.resolve(__dirname, 'preload.js'),
    },
  })
  win.loadFile(path.resolve(__dirname, 'remind/remind.html'), () => {})
  win.on('ready-to-show', () => {
    win.show()
    win.center()
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

const remind = () => {
  // 定时提醒
  if (!configC.remind) return null
  let remindObj = {
    win: null,
    timer: null,
  }
  remindObj.timer = setInterval(() => {
    if (remindObj.win) remindObj.win.close()
    remindObj.win = createRemindWindow()
    remindObj.win.on('close', () => {
      remindObj.win = null
    })
  }, configC.remind * 1000 * 60)
  return remindObj
}

app.whenReady().then(async () => {
  // win.webContents.openDevTools()
  await appInit()
  createMainWindow()
  createMenu()
  let remindObj = remind()

  ipcMain.on('set-remind', async (event, value) => {
    // 监听设置间隔时间
    configC.remind = Number(value) > 0 ? Number(value) : ''
    fs.writeFile(path.resolve(__dirname, 'config.json'), JSON.stringify(configC), (err) => {})
    if (remindObj.timer) clearInterval(remindObj.timer)
    if (remindObj.win) remindObj.win.close()
    remindObj = remind()
  })

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
