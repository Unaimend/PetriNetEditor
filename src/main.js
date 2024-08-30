const { app, BrowserWindow, ipcMain, dialog, Menu, MenuItem } = require('electron');
const path = require('path');
const fs = require('fs');


function createSecondWindow(data) {
  // Create the second window
  secondWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      preload: path.join(__dirname, 'preload_second.js'),
      enableRemoteModule: false,
      nodeIntegration: true 
    }
  });

  secondWindow.loadFile('second.html');

  // Pass data to the second window
  secondWindow.webContents.on('did-finish-load', () => {

    secondWindow.webContents.openDevTools();
    secondWindow.webContents.send('ipcRenderer', data);
  });

  secondWindow.on('closed', function () {
    secondWindow = null;
  });
}


function createWindow() {
  const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
          nodeIntegration: true,
          preload: path.join(__dirname, 'preload.js'),
      }
  });

  const item = { 
    label : "Debug",
    submenu: [
      {
        label: 'Hide zero place',
        accelerator: 'Alt+Shift+I',
        click: () => {
          win.webContents.send('hideZeroPlaces')
        },
      },
      {
        label: 'Show token history',
        accelerator: 'Alt+Shift+H',
        click: () => {
          win.webContents.send('getTokenHistory')
        },
      },
    ],
  }

  var menu = Menu.getApplicationMenu()
  menu.append(new MenuItem(item))
  Menu.setApplicationMenu(menu)



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
  
  // Function to open the open dialog
  const openFileDialog = async () => {
    var path = await dialog.showOpenDialog(win, {
      title: 'Open File', // Title of the dialog
      defaultPath: app.getPath('documents'), // Default directory to open
      buttonLabel: 'Open', // Label for the open button
      filters: [
        { name: 'Petri Nets', extensions: ['json'] }, // Limit file types to .txt
        { name: 'All Files', extensions: ['*'] } // Allow all file types
      ],
      properties: ['openFile'] // Allow only file selection (not directories)
    })
    console.log(path)
    if (!path.canceled && path.filePaths.length > 0) {
      console.log('Selected file path:', path.filePaths[0]);
      var c = fs.readFileSync(path.filePaths[0], { encoding: 'utf8', flag: 'r' });
      console.log(c)
      return c  // Read the selected file
    }
    //var c = fs.readFileSync("/home/td/Documents/o2.json", { encoding: 'utf8', flag: 'r' });
    //return c
  };


  ipcMain.handle('ping', () => 'pong')
  ipcMain.handle('save', (event, data) => {
    openSaveDialog(data)
  })

  ipcMain.handle('sendHistoryData', (event, data) => {
    createSecondWindow(data)
  })

  ipcMain.handle('load', async () => {
  try {
    var content = await openFileDialog()
    return content
  } catch (error) {
    console.error("Promise rejected:", error);
    // Handle errors if any
  }})


  win.webContents.openDevTools();
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);
