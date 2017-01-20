

function specWin (command){
    //console.log(`Sending to main command: ${command}`);
    ipcRenderer.send('spectator-window', command);
}

