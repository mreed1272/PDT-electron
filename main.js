const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

var mainWindow = null;

//global.fileToOpen = null;

app.on('ready',()=>{
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        //transparent: true
        });
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    mainWindow.openDevTools();

    mainWindow.on('maximize', ()=> {
        mainWindow.webContents.send('maximized');
    });
    
    mainWindow.on('unmaximize', () => {
        mainWindow.webContents.send('restored')
    });
});

/*app.on('open-file', (event, filePath)=> {
    event.preventDefault();
    fileToOpen = filePath;

    if(mainWindow){
        mainWindow.send('open-file', filePath);
    };
});

ipcMain.on('main-window', (event, windowActionName) => {
    if (windowActionName === 'restore') {
        mainWindow.unmaximize();
    } else {
        mainWindow[windowActionName]();
    };
});*/