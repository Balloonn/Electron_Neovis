const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
require('./api')

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  // Menu.setApplicationMenu(null)
  win.loadFile('index.html')
}
var pyProc = null
function startServer() {
  let backend_exe = path.join(process.cwd(), '/resources/backend_dist','Desktop.exe')
  if (process.env.NODE_ENV && process.env.NODE_ENV.trim() === 'dev') {
    backend_exe = path.join(process.cwd(), '/backend_dist','Desktop.exe')
  }
  pyProc = require('child_process').execFile(backend_exe)
  if (pyProc != null) {
    console.log('flask server start success')
  }
}

function stopServer() {
  pyProc.kill()
  console.log('kill flask server success')
  pyProc = null
}

app.whenReady().then(() => {
  // startServer()
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
  // stopServer()
})


const isMac = process.platform === 'darwin'

const template = [
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: '文件',
    submenu: [
      isMac ? { label:'关闭', role: 'close' } : { label:'退出', role: 'quit' }
    ]
  },
  // { role: 'editMenu' }
  {
    label: '编辑',
    submenu: [
      { label:'撤销', role: 'undo' },
      { label:'重做', role: 'redo' },
      { type: 'separator' },
      { label:'剪贴', role: 'cut' },
      { label:'复制', role: 'copy' },
      { label:'粘贴', role: 'paste' },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { label:'删除', role: 'delete' },
        { label:'全选', role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startSpeaking' },
            { role: 'stopSpeaking' }
          ]
        }
      ] : [
        { label:'删除', role: 'delete' },
        { type: 'separator' },
        { label:'全选', role: 'selectAll' }
      ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: '视图',
    submenu: [
      { label:'刷新', role: 'reload' },
      { label:'强制刷新', role: 'forceReload' },
      { label:'切换开发工具', role: 'toggleDevTools' },
      { type: 'separator' },
      { label:'重置比例', role: 'resetZoom' },
      { label:'放大', role: 'zoomIn' },
      { label:'缩小', role: 'zoomOut' },
      { type: 'separator' },
      { label:'全屏', role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: '窗口',
    submenu: [
      { label:'最小化', role: 'minimize' },
      // { label:'比例', role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { label:'关闭', role: 'close' }
      ])
    ]
  },
  {
    label: '帮助',
    role: 'help',
    submenu: [
      {
        label: '了解更多',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://electronjs.org')
        }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)