const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    ipcMain.handle('ping', () => 'pong')
    ipcMain.handle('save', (event, data) => {
      console.log(data)
    })


    win.webContents.openDevTools();
    win.loadFile('index.html');
}

app.whenReady().then(createWindow);
