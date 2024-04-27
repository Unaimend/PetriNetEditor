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
    win.webContents.openDevTools();
    win.loadFile('index.html');

    //https://evite.netlify.app/guide/dev.html#using-preload-scripts

    //ipcMain.handle('dt', () => d3)

}

app.whenReady().then(createWindow);
