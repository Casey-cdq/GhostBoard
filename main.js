var Sentry = require('@sentry/electron');
Sentry.init({dsn: 'https://8338bd2b3e404d2f9eff2929ede6c9b0@sentry.io/1499274'});

const { app, BrowserWindow,globalShortcut } = require('electron')
var cm = require("./common")
const log = require('electron-log')

// 保持对window对象的全局引用，如果不这么做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let win

function main_process_log(msg){
  log.info(msg)
}

function check_for_update(){
  main_process_log("call check_for_update")
  
}

function createWindow () {

  const {width, height} = require('electron').screen.getPrimaryDisplay().workAreaSize

  console.log("mainWindow:"+width+" x "+height)

  conf = {}
  conf.fullscreenable = false
  conf.fullscreen = false
  conf.x = width - width/6
  conf.y = height - height/6
  conf.width = 100
  conf.height = 200
  conf.show = false
  conf.alwaysOnTop = true
  conf.title = "幽灵股票"
  conf.frame = false
  conf.opacity = 1.0
  conf.resizable = false
  conf.useContentSize = true
  conf.minimizable = false
  conf.maximizable = false
  conf.webPreferences = {nodeIntegration:true}
  // conf.transparent = true

  // 创建浏览器窗口。
  win = new BrowserWindow(conf)

  // 然后加载应用的 index.html。
  win.loadFile('render/index.html')

  // 打开开发者工具
  if(!app.isPackaged){
    win.webContents.openDevTools({ mode: 'detach' })
  } 
  win.once('ready-to-show', () => {
    win.show()
  })
  global.indexwindow = win

  // 当 window 被关闭，这个事件会被触发。
  win.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    win = null
  })

  cm.get_current_config(function(conf){
    win.setOpacity(conf.opa)
  })
}


// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', createWindow)

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (win === null) {
    createWindow()
  }
})

// 在这个文件中，你可以续写应用剩下主进程代码。
// 也可以拆分成几个文件，然后用 require 导入。