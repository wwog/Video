const glasstron = require('glasstron')//通用透明
glasstron.init() // 注入新的electron
const { app, BrowserWindow, ipcMain } = require('electron')
const resource = require('./src/resource')
const path = require('path')
let mainMax = false;//用于控制透明窗口的最大化问题
let mainWin;
app.on('ready', () => {
  mainWin = createMainWindow()
  app.on('window-all-closed', () => {
    app.quit()
  })
})
function createMainWindow() {
  let win = new BrowserWindow({
    frame: false,
    transparent: true,
    show: false,
    minWidth: 800,
    minHeight: 400,
    width: 1000,
    title: '具映',
    icon: path.resolve(__dirname,'./view/images/16.png'),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule:true
    }
  })
  win.loadFile(path.resolve(__dirname, './view/pages/main/main.html'))
  win.on('ready-to-show', () => {
    win.show()
  })
  win.on('maximize', () => {
    mainMax = true
  })
  win.on('unmaximize', () => {
    mainMax = false
  })
  glasstron.update(win, {
    windows: { blurType: 'blurbehind' },//Aero
    //             blurbehind      ^acrylic亚克力/transparent透明
    // Windows 10 1803+; for older versions you might want to use 'blurbehind'
    macos: { vibrancy: 'fullscreen-ui' },
    linux: { requestBlur: true } // KWin
  })
  return win
}

ipcMain.on('push', (e, arg) => {
  if (arg == 'init') {
    //读取总榜_aqiyi
    resource.pushIqyTop(2).then(value => {
      mainWin.webContents.send('init_iqiyi', "电视剧", value)
      resource.pushIqyTop(1).then(value => {
        mainWin.webContents.send('init_iqiyi', "电影", value)
      }).catch(reason => { })
      resource.pushIqyTop(6).then(value => {
        mainWin.webContents.send('init_iqiyi', "综艺", value)
      }).catch(reason => { })
      resource.pushBdtop().then(value => {
        mainWin.webContents.send('init_bdTop', value)
      }).catch(reason => { })
      resource.pushHotSearch().then(value => {
        mainWin.webContents.send('init_hot_s', value)
      }).catch(reason => { })
    }).catch(reason => {
      console.log(reason);
    })
  }
})
ipcMain.on('query', (e, query) => {
  //查询接口....
  resource.queryName(query).then(value => {
    mainWin.webContents.send('query', value)
  }).catch(reason => {
    console.log(reason);
  })
})
ipcMain.on('detail', (e, requestUrl) => {
  resource.request(requestUrl).then(value => {
    if (value.rss) {
      if (value.rss.list) {
        if (value.rss.list.video) {
          mainWin.webContents.send('detail', true, value.rss.list.video)
          return
        }
      }
    }
    mainWin.webContents.send('datail', false)
  }).catch(reason => {
    console.log(reason);
  })
})
