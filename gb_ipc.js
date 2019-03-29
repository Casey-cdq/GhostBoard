const {BrowserWindow} = require('electron')

exports.new_add_window = () = >{
	
  conf = {}
  conf.fullscreenable = false
  conf.fullscreen = false
  conf.width = 400
  conf.height = 50
  conf.show = false
  conf.alwaysOnTop = false
  conf.title = "幽灵看盘"
  conf.frame = false
  conf.opacity = 1.0
  conf.resizable = false
  conf.useContentSize = true
  conf.minimizable = false
  conf.maximizable = false
  // conf.transparent = true

  // 创建浏览器窗口。
  win = new BrowserWindow(conf)

  // 然后加载应用的 index.html。
  win.loadFile('render/add.html')

  // 打开开发者工具
  win.webContents.openDevTools()
  win.once('ready-to-show', () => {
    win.show()
  })

  // 当 window 被关闭，这个事件会被触发。
  win.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    win = null
  })

}