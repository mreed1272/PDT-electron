const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

var mainWindow = null;
var spectatorWindow = null;
var splashWindow = null;

//global.fileToOpen = null;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        frame: true,
        x: 25,
        y: 25,
        show: false
        //transparent: true
    });
    mainWindow.loadURL(`file://${__dirname}/app/index.html`);

    mainWindow.openDevTools();

    spectatorWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        frame: true,
        show: false
        //transparent: true
    });
    spectatorWindow.loadURL(`file://${__dirname}/app/spectator.html`);

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
        spectatorWindow = new BrowserWindow({
            width: 1024,
            height: 768,
            frame: true,
            show: false
            //transparent: true
        });
        spectatorWindow.loadURL(`file://${__dirname}/app/spectator.html`);

        spectatorWindow.once('ready-to-show', () => {
            if (command === "open") {
                spectatorWindow.show();
            }
        })

        spectatorWindow.on('closed', () => {
            console.log("User clicked on close for spectator window - clear the reference.")
            spectatorWindow = null;
        });

    };

});

app.on('window-all-closed', () => {
    console.log("All windows closed -> quitting app")
    app.quit();
});
