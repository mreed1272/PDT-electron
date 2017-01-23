

function specWin (command){
    //console.log(`Sending to main command: ${command}`);
    ipcRenderer.send('spectator-window', command);
}

function updateRaceTable() {
    var trOut = "";
    var racerTmpTable = document.getElementById("racer-table");

    trOut += "<tr><th>Car<br/>#</th><th>Racer Name</th><th>Racer<br/>Rank</th><th>Total<br/>Time (s)</th></tr>";

    for (var i = 0; i < includedRacers.length; i++){

        trOut += `<tr><td>${racerStats[includedRacers[i]].car}</td>`;
        trOut += `<td>${racerStats[includedRacers[i]].racer_name}</td>`;
        trOut += `<td>${racerStats[includedRacers[i]].rank}</td>`;
        trOut += `<td>${racerStats[includedRacers[i]].total_time}</td></tr>`;
    }

    racerTmpTable.innerHTML = trOut;

}
