const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');


function createWindow() {
  const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
          nodeIntegration: true,
          preload: path.join(__dirname, 'preload.js'),
      }
  });

  const openSaveDialog = (data) => {
    dialog.showSaveDialog(win, {
      title: 'Save File', // Title of the dialog
      defaultPath: path.join(app.getPath('documents'), 'untitled.json'), // Default path and filename
      buttonLabel: 'Save', // Label for the save button
      filters: [
        { name: 'Petri Nets', extensions: ['json'] }, // Limit file types to .txt
        { name: 'All Files', extensions: ['*'] } // Allow all file types
      ]
    }).then(result => {
      if (!result.canceled) {
        console.log('Selected file path:', result.filePath);
        try {
          fs.writeFileSync(result.filePath, data)
        } catch (err) {
          console.error(err)
        }
      }
    }).catch(err => {
      console.error(err);
    });
  };



  ipcMain.handle('ping', () => 'pong')
  ipcMain.handle('save', (event, data) => {
    openSaveDialog(JSON.stringify(data))
    console.log(data)
  })


  win.webContents.openDevTools();
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);
