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

var racerArray = [];
var roundResults = [];
var raceInfo = [];

var numLanes = 0;
var numRacers = 0;
var numHeats = 0;
var numRounds = 0;
var currentHeatNum = 0;
var currentRndNum = 0;

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
      frame: false,
      show: false,
      /*skipTaskbar: true,*/
      icon: PDTimage,
      x: externalDisplay.bounds.x,
      y: externalDisplay.bounds.y
      //transparent: true
    });
  } else {
    spectatorWindow = new BrowserWindow({
      width: 1024,
      height: 768,
      frame: false,
      show: false,
      /*skipTaskbar: true,*/
      icon: PDTimage,
      //transparent: true
    });
  };
  spectatorWindow.loadURL(`file://${__dirname}/app/spectator.html`);
  spectatorWindow.openDevTools()
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
        frame: false,
        show: false,
        /*skipTaskbar: true,*/
        icon: `${__dirname}/app/images/PDT-main.png`,
        x: externalDisplay.bounds.x,
        y: externalDisplay.bounds.y
        //transparent: true
      });
    } else {
      spectatorWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        frame: false,
        show: false,
        /*skipTaskbar: true,*/
        icon: `${__dirname}/app/images/PDT-main.png`,
        //transparent: true
      });
    };
    spectatorWindow.loadURL(`file://${__dirname}/app/spectator.html`);
    spectatorWindow.openDevTools()
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

ipcMain.on('startup', (event) => {
  var data = {};
  if (!isObjEmpty(raceInfo)){
    data["raceInfo"] = raceInfo;
  }
  if (!isObjEmpty(racerArray)){
    data["racerArray"] = racerArray;
  }
  if (!isObjEmpty(roundResults)){
    data["roundResults"] = roundResults;
  }
  if (numLanes > 0){ data["numLanes"] = numLanes};
  if (numHeats > 0){ data["numHeats"] = numHeats};
  if (currentHeatNum > 0){ data["currentHeatNum"] = currentHeatNum};
  if (currentRndNum > 0){ data["currentRndNum"] = currentRndNum};

  event.returnValue = data;

})

ipcMain.on('race-information', (event, data) => {
  raceInfo = data[0];
  numLanes = data[1];
  numRounds = data[0].RaceRounds;

  if (specContents !== null) {
    specContents.send('race-information', data)
  }
})

ipcMain.on('setup-race', (event, data) => {
  racerArray = data[1];
  currentRndNum = data[2];
  currentHeatNum = data[3];
  numHeats = data[4];
  numRacers = racerArray.length;
  roundResults = data[0];

  if (specContents !== null) {
    specContents.send('setup-race', data)
  }
})

ipcMain.on('stop-race', (event, data) => {
  roundResults = data[0];
  racerArray = data[1];
  
  if (specContents !== null) {
    specContents.send('stop-race', data)
  }
})

ipcMain.on('post-results', (event,data) => {
  
  if (specContents !== null) {
    specContents.send('post-results', data)
  }
});

ipcMain.on('redo', (event) => {
  
  if (specContents !== null) {
    specContents.send('redo');
  }
})

ipcMain.on('update-information', (event,data) => {
  racerArray = data[1];
  currentRndNum = data[2];
  currentHeatNum = data[3];
  numHeats = data[4];
  numRacers = racerArray.length;
  roundResults = data[0];
  
  if (specContents !== null) {
    specContents.send('update-information', data)
  }
})

app.on('window-all-closed', () => {
  console.log("All windows closed -> quitting app")
  app.quit();
});

function isObjEmpty(obj) {
  for (var x in obj) { if (obj.hasOwnProperty(x)) return false; }
  return true;
}