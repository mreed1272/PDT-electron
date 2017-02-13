const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const nativeImage = electron.nativeImage;

let PDTimage = nativeImage.createFromPath(`${__dirname}/app/images/PDT-main.png`);

var mainWindow = null;
var spectatorWindow = null;
var splashWindow = null;

let mainContents = null;
let specContents = null;

//global.fileToOpen = null;

app.on('ready', () => {
  let displays = electron.screen.getAllDisplays();
  let externalDisplay = displays.find((display) => {
    return display.bounds.x !== 0 || display.bounds.y !== 0;
  })
  //console.log(externalDisplay);

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    frame: true,
    x: 25,
    y: 25,
    show: false,
    icon: PDTimage
    //transparent: true
  });
  mainWindow.loadURL(`file://${__dirname}/app/index.html`);

  mainWindow.openDevTools();

  mainContents = mainWindow.webContents;

  if (externalDisplay) {
    spectatorWindow = new BrowserWindow({
      width: externalDisplay.bounds.width,
      height: externalDisplay.bounds.height,
      frame: true,
      show: false,
      skipTaskbar: true,
      icon: PDTimage,
      x: externalDisplay.bounds.x,
      y: externalDisplay.bounds.y
      //transparent: true
    });
  } else {
    spectatorWindow = new BrowserWindow({
      width: 1024,
      height: 768,
      frame: true,
      show: false,
      skipTaskbar: true,
      icon: PDTimage,
      //transparent: true
    });
  };
  spectatorWindow.loadURL(`file://${__dirname}/app/spectator.html`);
  specContents = spectatorWindow.webContents;

  /*mainWindow.on('maximize', ()=> {
      mainWindow.webContents.send('maximized');
  });
  
  mainWindow.on('unmaximize', () => {
      mainWindow.webContents.send('restored')
  });*/
  mainWindow.on('closed', () => {
    console.log("Main window closed - quitting app");
    mainWindow = null;
    app.quit();
  });
  spectatorWindow.on('closed', () => {
    console.log("User clicked on close for spectator window - clear the reference.")
    spectatorWindow = null;
    specContents = null;
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
});

/*app.on('open-file', (event, filePath)=> {
    event.preventDefault();
    fileToOpen = filePath;

    if(mainWindow){
        mainWindow.send('open-file', filePath);
    };
});
*/
ipcMain.on('spectator-window', (event, command) => {
  //console.log(spectatorWindow);
  if (spectatorWindow != null) {
    switch (command) {
      case "open":
        spectatorWindow.show();
        break;

      case "close":
        spectatorWindow.hide();
    }
  } else if (spectatorWindow === null) {
    let displays = electron.screen.getAllDisplays();
    let externalDisplay = displays.find((display) => {
      return display.bounds.x !== 0 || display.bounds.y !== 0;
    })

    if (externalDisplay) {
      spectatorWindow = new BrowserWindow({
        width: externalDisplay.bounds.width,
        height: externalDisplay.bounds.height,
        frame: true,
        show: false,
        skipTaskbar: true,
        icon: `${__dirname}/app/images/PDT-main.png`,
        x: externalDisplay.bounds.x,
        y: externalDisplay.bounds.y
        //transparent: true
      });
    } else {
      spectatorWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        frame: true,
        show: false,
        skipTaskbar: true,
        icon: `${__dirname}/app/images/PDT-main.png`,
        //transparent: true
      });
    };
    spectatorWindow.loadURL(`file://${__dirname}/app/spectator.html`);
    specContents = spectatorWindow.webContents;

    spectatorWindow.once('ready-to-show', () => {
      if (command === "open") {
        spectatorWindow.show();
      }
    })

    spectatorWindow.on('closed', () => {
      console.log("User clicked on close for spectator window - clear the reference.")
      spectatorWindow = null;
      specContents = null;
    });

  };

});

app.on('window-all-closed', () => {
  console.log("All windows closed -> quitting app")
  app.quit();
});
