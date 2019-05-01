'use strict'

import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron'
import baseWinConfig from '../config/window.config'
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:8090/`
    : `file://${__dirname}/index.html`
let mainWindow

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', initWindow)

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
    if (mainWindow === null) {
        initWindow()
    }
})

// ipcMain.on('openUrl', function (e, data) {
//     console.log(1111, data)
//     const url = `${winURL}${data.url}`
//     let win = new BrowserWindow({ width: data.winWidth, height: winHeight })
//     win.on('close', function () { win = null })
//     win.loadURL(url)
// })

function initWindow () {
    let window = createWindow()
    addShortCut(window)
}

function createWindow () {
    const { width, height } = require('electron').screen.getPrimaryDisplay().workAreaSize
    const config = {
        x: width - width / 5,
        y: height - height / 5
    }
    const conf = Object.assign({}, baseWinConfig, config)

    // 创建浏览器窗口。
    mainWindow = new BrowserWindow(conf)

    // 然后加载应用的 index.html。
    mainWindow.loadURL(winURL)

    // 打开开发者工具
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools({mode: 'detach'})
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })

    // 当 window 被关闭，这个事件会被触发。
    mainWindow.on('closed', () => {
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 与此同时，你应该删除相应的元素。
        mainWindow = null
    })

    return mainWindow
}

function addShortCut (window) {
    const maxOpacity = 1
    const minOpacity = 0.05
    const delta = 0.05

    globalShortcut.register('CommandOrControl+[', () => {
        // Do stuff when Y and either Command/Control is pressed.
        let currentOpacity = window.getOpacity()
        let resultOpacity = Math.max(currentOpacity - delta, minOpacity)

        window.setOpacity(resultOpacity)
    })

    globalShortcut.register('CommandOrControl+]', () => {
        // Do stuff when Y and either Command/Control is pressed.
        let currentOpacity = window.getOpacity()
        let resultOpacity = Math.min(currentOpacity + delta, maxOpacity)

        window.setOpacity(resultOpacity)
    })
}

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
