const electron = require('electron');
const remote = electron.remote;
const dialog = electron.remote.dialog;
//const shell = electron.shell;
//const fs = require('fs');
const ipcRenderer = electron.ipcRenderer;
const { Menu, MenuItem } = remote;

var racerArray = [];
var roundResults = [];
var raceInfo = [];
var laneTimes = [];
var finalResults = [];

var numLanes = 0;
var numRacers = 0;
var numHeats = 0;
var numRounds = 0;
var currentHeatNum = 0;
var currentRndNum = 0;

var titleDiv = "";
var roundNumDiv = "";
var heatNumDiv = "";
var currentHeatDiv = "";
var currentRoundDiv = "";
var leaderBoardDiv = "";
var champDiv = "";

//let's create constants pointing to images for the ranks

const defaultImg = `${__dirname}/images/PDT-main-256.png`;
const tigerImg = `${__dirname}/images/tiger-trans.png`;
const wolfImg = `${__dirname}/images/wolf-trans.png`;
const bearImg = `${__dirname}/images/bear-trans.png`;
const webelosImg = `${__dirname}/images/webelos-trans.png`;
const aolImg = `${__dirname}/images/aol-trans.png`;

//create context menu
const rightMenu = new Menu();
const rightMenuItem = new MenuItem({ label: 'Open/Close Console', role: 'toggledevtools' });

rightMenu.append(rightMenuItem);

window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  rightMenu.popup(remote.getCurrentWindow());
})

function getInfo() {
  var data = ipcRenderer.sendSync('startup');
  if (data.hasOwnProperty("raceInfo")) {
    raceInfo = data.raceInfo
    numRounds = raceInfo.RaceRounds
    if (raceInfo.OrgName != "") {
      titleDiv.innerHTML = `${raceInfo.OrgName} Pinewood Derby Race`
    }
  };
  if (data.hasOwnProperty("racerArray")) {
    racerArray = data.racerArray
    numRacers = racerArray.length;
  } else {

    clearObject(racerArray);
  }
  if (data.hasOwnProperty("roundResults")) {
    roundResults = data.roundResults
  } else {

    clearObject(roundResults);
  };
  if (data.hasOwnProperty("numLanes")) { numLanes = data.numLanes };
  if (data.hasOwnProperty("numHeats")) { numHeats = data.numHeats };
  if (data.hasOwnProperty("currentHeatNum")) { currentHeatNum = data.currentHeatNum };
  if (data.hasOwnProperty("currentRndNum")) { currentRndNum = data.currentRndNum };
  if (raceInfo.hasOwnProperty("race_finished") && raceInfo.race_finished == true) {
    roundResults = JSON.parse(JSON.stringify(raceInfo.heat_results));
    racerArray = JSON.parse(JSON.stringify(raceInfo.racer_table))
    showResults();

  } else {
    setupDisplay();
    updateLeaderBoard();
    updateCurrentRound();
    updateDisplay();
  }
}

function setVariables() {
  titleDiv = document.getElementById("spec-title");
  roundNumDiv = document.getElementById("RoundNo");
  heatNumDiv = document.getElementById("HeatNo");
  currentHeatDiv = document.getElementById("CurrentHeat");
  currentRoundDiv = document.getElementById("CurrentRound");
  leaderBoardDiv = document.getElementById("LeaderBoard");
  champDiv = document.getElementById("ChampRound");
}

ipcRenderer.on('race-information', (event, data) => {
  raceInfo = data[0];
  numLanes = data[1];
  numRounds = data[0].RaceRounds;
  if (raceInfo.OrgName != "") {
    titleDiv.innerHTML = `${raceInfo.OrgName} Pinewood Derby Race`
  }
  if (raceInfo.hasOwnProperty("race_finished") && raceInfo.race_finished == true) {
    roundResults = JSON.parse(JSON.stringify(raceInfo.heat_results));
    racerArray = JSON.parse(JSON.stringify(raceInfo.racer_table))
    showResults();
  } else {
    if (!isObjEmpty(racerArray)) { clearObject(racerArray); }
    if (!isObjEmpty(roundResults)) { clearObject(roundResults); }
    setupDisplay();
    updateLeaderBoard();
    updateCurrentRound();
    //updateDisplay();
  }
})

ipcRenderer.on('setup-race', (event, data) => {
  racerArray = data[1];
  currentRndNum = data[2];
  currentHeatNum = data[3];
  numHeats = data[4];
  numRacers = racerArray.length;
  roundResults = data[0];
  setupDisplay();
  updateLeaderBoard();
  updateCurrentRound();
  updateDisplay();
})

ipcRenderer.on('stop-race', (event, data) => {
  roundResults = data[0];
  racerArray = data[1];

  updateLeaderBoard();
  updateCurrentRound();
  updateDisplay();
})

ipcRenderer.on('post-results', (event, data) => {
  //sort the data on time
  data.sort(function (a, b) {
    return a.time - b.time;
  })
  //update the lane times and indicate winner
  for (var l = 0; l < numLanes; l++) {
    if (data[l].time != 99) {
      var tmpID = `Lane-Time-${data[l].lane}`;
      var tmp2ID = `Lane${data[l].lane}Place`;
      document.getElementById(tmpID).innerHTML = (data[l].time).toFixed(4);

      switch (l + 1) {
        case 1:
          document.getElementById(tmp2ID).innerHTML = `1st Place <span class='winner'>&#xf091;</span>`;
          break;
        case 2:
          document.getElementById(tmp2ID).innerHTML = "2nd Place";
          break;
        case 3:
          document.getElementById(tmp2ID).innerHTML = "3rd Place";
          break;
        default:
          document.getElementById(tmp2ID).innerHTML = `${l + 1}th Place`;
          break;
      }
      showTxt(tmp2ID);
    }
  }

});

ipcRenderer.on('redo', (event) => {
  //clear the lane times and places to redo the heat
  for (var l = 1; l <= numLanes; l++) {
    var tmpID = `Lane-Time-${l}`;
    var tmp2ID = `Lane${l}Place`;
    document.getElementById(tmpID).innerHTML = (0.0000).toFixed(4);
    document.getElementById(tmp2ID).innerHTML = "-";
    hideTxt(tmp2ID);
  }

})

ipcRenderer.on('update-information', (event, data) => {
  //get new arrays and update displays
  roundResults = data[0];
  racerArray = data[1];
  currentRndNum = data[2];
  currentHeatNum = data[3];
  numHeats = data[4];
  numRacers = racerArray.length;

  updateLeaderBoard();
  updateCurrentRound();

})

ipcRenderer.on('next', (event, data) => {
  //get new arrays and update displays
  roundResults = data[0];
  racerArray = data[1];
  currentRndNum = data[2];
  currentHeatNum = data[3];
  numHeats = data[4];
  numRacers = racerArray.length;

  //setupDisplay();
  updateLeaderBoard();
  updateCurrentRound();
  updateDisplay();

  //clear the lane times and places for next heat
  for (var l = 1; l <= numLanes; l++) {
    var tmpID = `Lane-Time-${l}`;
    var tmp2ID = `Lane${l}Place`;
    document.getElementById(tmpID).innerHTML = (0.0000).toFixed(4);
    document.getElementById(tmp2ID).innerHTML = "-";
    hideTxt(tmp2ID);
  }
})

ipcRenderer.on('winner-no-extra', (event, data) => {
  //get new arrays and update displays
  roundResults = data[0];
  racerArray = data[1];
  currentRndNum = data[2];
  currentHeatNum = data[3];
  numHeats = data[4];
  numRacers = racerArray.length;

  updateLeaderBoard();
  updateCurrentRound();

  currentRoundDiv.style.display = "none";

  //create cards showing winners 1st through 3rd unless number of racers is less than 3
  //console.log('Calling winnerCards empty from "winner-no-extra"')
  winnerCards();

})

ipcRenderer.on('winner-extra', (event, data) => {
  //console.log("Running winner-extra.")
  //console.log(data);
  //get new arrays and update displays
  roundResults = data[0];
  racerArray = data[1];
  currentRndNum = data[2];
  currentHeatNum = data[3];
  numHeats = data[4];
  finalResults = data[5];
  numRacers = racerArray.length;

  updateLeaderBoard();
  updateCurrentRound();

  currentRoundDiv.style.display = "none";

  for (var l = 0; l < numLanes; l++) {
    finalResults[l].racer_name = racerArray[IndexByKeyValue(racerArray, "car", finalResults[l].car)].racer_name;
    finalResults[l].rank = racerArray[IndexByKeyValue(racerArray, "car", finalResults[l].car)].rank;
  }

  if (numLanes < 3) {
    racerArray.sort(function (a, b) {
      return a.total_time - b.total_time;
    })
    finalResults[2] = {};
    finalResults[2].car = racerArray[2].car;
    finalResults[2].rank = racerArray[2].rank;
    finalResults[2].racer_name = racerArray[2].racer_name;
    finalResults[2].heat_time = racerArray[2].total_time;
  }
  //console.log(`Final results: ${finalResults}`);
  //console.log("Calling winnerCards from 'winner-extra'");
  winnerCards(finalResults);
})

ipcRenderer.on('champ-round', (event, data) => {
  //get new arrays and update displays
  roundResults = data[0];
  racerArray = data[1];
  currentRndNum = data[2];
  currentHeatNum = data[3];
  numHeats = data[4];
  numRacers = racerArray.length;

  updateLeaderBoard();
  updateCurrentRound();
  updateDisplay();

  //clear the lane times and places for next heat
  for (var l = 1; l <= numLanes; l++) {
    var tmpID = `Lane-Time-${l}`;
    var tmp2ID = `Lane${l}Place`;
    document.getElementById(tmpID).innerHTML = (0.0000).toFixed(4);
    document.getElementById(tmp2ID).innerHTML = "-";
    hideTxt(tmp2ID);
  }

  //Change the banner to display champ round and hide round and heat
  champDiv.style.display = "block";
  roundNumDiv.style.display = "none";
  heatNumDiv.style.display = "none";

})

ipcRenderer.on('best-show-results', (event, data) => {
  //console.log(`Data sent to spec window from best-in-show : ${JSON.stringify(data)}`);
  showWinners(data);
});

function showWinners(data) {
  const bestShowDIV = document.getElementById("bestShowWinners");
  //console.log("running show winners in spec window")

  if (!isObjEmpty(data)) {

    //create the txt first
    var tmpText = "";
    tmpText += `<div class='flex-container-row' style='perspective: 1500px; justify-content: center'>`;
    tmpText += `<div class='show_first_place'>`;
    tmpText += `<h1>1<sup>st</sup> Place <span class='winner'>&#xf091;</span></h1>`;
    tmpText += `<img id='imgShowWinner-1' src='${getImage(data["1st"].rank)}'>`;
    tmpText += `<p>${data["1st"].racer_name}</p>`;
    tmpText += `<p># ${data["1st"].car}</p>`;
    tmpText += `</div>`
    tmpText += `<div class='show_second_place'>`;
    tmpText += `<h1>2<sup>nd</sup> Place</h1>`;
    tmpText += `<img id='imgShowWinner-2' src='${getImage(data["2nd"].rank)}'>`;
    tmpText += `<p>${data["2nd"].racer_name}</p>`;
    tmpText += `<p># ${data["2nd"].car}</p>`;
    tmpText += `</div>`
    tmpText += `<div class='show_third_place'>`;
    tmpText += `<h1>3<sup>rd</sup> Place</h1>`;
    tmpText += `<img id='imgShowWinner-3' src='${getImage(data["3rd"].rank)}'>`;
    tmpText += `<p>${data["3rd"].racer_name}</p>`;
    tmpText += `<p># ${data["3rd"].car}</p>`;
    tmpText += `</div>`;
    tmpText += `</div>`;

    //now place it in the div
    bestShowDIV.innerHTML = tmpText;


  }
}

ipcRenderer.on('best-show-window', (event, data) => {
  //console.log(`Command sent to spec window from best-in-show : ${data}`);
  switch (data) {
    case "show":
      document.getElementById("spec-main").style.display = "none";
      document.getElementById("bestShowWinners").style.display = "block"
      break;

    case "hide":
      document.getElementById("spec-main").style.display = "block";
      document.getElementById("bestShowWinners").style.display = "none"
      break;

  }
});


function winnerCards(champ) {

  roundNumDiv.innerHTML = "";
  heatNumDiv.innerHTML = "";
  champDiv.style.display = "none";

  if (isObjEmpty(champ)) {
    //first sort the racerArray by total time
    racerArray.sort(function (a, b) {
      return a.total_time - b.total_time;
    })

    var tempTxt = "";
    tempTxt += `<div class='flex-container-row' style='perspective: 200px;'>`;

    for (var w = 0; w < 3; w++) {
      switch (w) {
        case 0:
          //(numRacers > 2) ? tempTxt += `<div class='first_place_A'>` : tempTxt += `<div class='first_place_B'>`;
          tempTxt += `<div class='first_place_B'>`;
          tempTxt += `<h1>1st Place <span class='winner'>&#xf091;</span></h1>`;
          break;

        case 1:
          //(numRacers > 2) ? tempTxt += `<div class='second_place_A'>` : tempTxt += `<div class='second_place_B'>`;
          tempTxt += `<div class='second_place_B'>`;
          tempTxt += `<h1>2nd Place</h1>`;
          break;

        case 2:
          tempTxt += `<div class='third_place'>`;
          tempTxt += `<h1>3rd Place</h1>`;
          break;
      }
      tempTxt += `<img id='imgWinner-${w}' src='${getImage(racerArray[w].rank)}'>`;
      tempTxt += `<p>${racerArray[w].racer_name}</p>`;
      tempTxt += `<p># ${racerArray[w].car}</p>`;
      tempTxt += `<p>${(racerArray[w].total_time).toFixed(4)} s</p>`;
      tempTxt += `</div>`
    }
    tempTxt += `</div>`

    currentHeatDiv.innerHTML = tempTxt;


  } else {
    //first sort the racerArray by heat time
    //console.log(champ);
    if (champ.hasOwnProperty("heat_time")) {
      champ.sort(function (a, b) {
        return a.heat_time - b.heat_time;
      })
    }

    var tempTxt = "";
    tempTxt += `<div class='flex-container-row' style='perspective: 200px;'>`;

    for (var w = 0; w < 3; w++) {
      switch (w) {
        case 0:
          /*(numRacers > 2) ? tempTxt += `<div class='first_place_A'>` : tempTxt += `<div class='first_place_B'>`;*/
          tempTxt += `<div class='first_place_B'>`;
          tempTxt += `<h1>1st Place <span class='winner'>&#xf091;</span></h1>`;
          break;

        case 1:
          /*(numRacers > 2) ? tempTxt += `<div class='second_place_A'>` : tempTxt += `<div class='second_place_B'>`;*/
          tempTxt += `<div class='second_place_B'>`;
          tempTxt += `<h1>2nd Place</h1>`;
          break;

        case 2:
          tempTxt += `<div class='third_place'>`;
          tempTxt += `<h1>3rd Place</h1>`;
          break;
      }
      var racerIndex = IndexByKeyValue(racerArray, "car", champ[w].car);
      if (champ[w].hasOwnProperty("rank")) {
        tempTxt += `<img id='imgWinner-${w}' src='${getImage(champ[w].rank)}'>`;
      } else {
        tempTxt += `<img id='imgWinner-${w}' src='${getImage(racerArray[racerIndex].rank)}'>`;
      }
      if (champ[w].hasOwnProperty("racer_name")){
        tempTxt += `<p>${champ[w].racer_name}</p>`;
      } else {
        tempTxt += `<p>${racerArray[racerIndex].racer_name}</p>`;
      }
      tempTxt += `<p># ${champ[w].car}</p>`;
      
      if (champ.hasOwnProperty("heat_time")) {
        tempTxt += `<p>${(champ[w].heat_time).toFixed(4)} s</p>`;
      } else if (champ.hasOwnProperty("time")) {
        tempTxt += `<p>${(champ[w].time).toFixed(4)} s</p>`;
      }
      tempTxt += `</div>`
    }
    tempTxt += `</div>`

    currentHeatDiv.innerHTML = tempTxt;

  }
}

function getImage(rank) {
  switch (rank) {
    case "Tiger":
      return tigerImg;

    case "Wolf":
      return wolfImg;

    case "Bear":
      return bearImg;

    case "Webelos":
      return webelosImg;

    case "AOL":
      return aolImg;

    default:
      return defaultImg;
  }
}

function setupDisplay() {
  //build lane displays for the first time
  var tempTxt = "";
  tempTxt += `<div class='flex-container-row'>`;
  for (var l = 1; l <= numLanes; l++) {
    tempTxt += `<div class='flex-container-col'>`;
    tempTxt += `<h2>Lane ${l}</h2>`;
    tempTxt += `<div class='LanePlace' id='Lane${l}Place'>Place</div>`;
    tempTxt += `<img id='imgLane-${l}' src='${defaultImg}'>`;
    tempTxt += `<div id='Racer-Lane-${l}' class='racerTxt'>Name <br/> Car #</div>`;
    tempTxt += `<ul><li id='Lane-Time-${l}' class='LEDDisplay'>0.0000</li></ul>`;
    tempTxt += `</div>`
  }
  tempTxt += `</div>`
  currentHeatDiv.innerHTML = tempTxt;
  for (var l = 1; l <= numLanes; l++) { hideTxt(`Lane${l}Place`); }
}

function updateDisplay() {

  if (roundNumDiv.style.display == "none") {
    roundNumDiv.style.display = "block";
    heatNumDiv.style.display = "block";
    champDiv.style.display = "none";
  }
  roundNumDiv.innerHTML = `Round: ${currentRndNum} / ${numRounds}`;
  heatNumDiv.innerHTML = `Heat: ${currentHeatNum} / ${numHeats}`;

  if (!isObjEmpty(racerArray) && !isObjEmpty(roundResults)) {
    for (l = 0; l < numLanes; l++) {
      var tempCar = roundResults[currentRndNum - 1][l][currentHeatNum - 1].car;
      if (tempCar == "-") {
        var tempName = "No Racer";
        var tempRank = "none";
      } else {
        var tempIndex = IndexByKeyValue(racerArray, "car", tempCar);
        var tempName = racerArray[tempIndex].racer_name;
        var tempRank = racerArray[tempIndex].rank;
      }
      var tempImg = document.getElementById(`imgLane-${l + 1}`);
      var tempDiv = document.getElementById(`Racer-Lane-${l + 1}`);

      tempDiv.innerHTML = `${tempName}<br/># ${tempCar}`;

      switch (tempRank) {
        case "Tiger":
          tempImg.src = tigerImg;
          break;

        case "Wolf":
          tempImg.src = wolfImg;
          break;

        case "Bear":
          tempImg.src = bearImg;
          break;

        case "Webelos":
          tempImg.src = webelosImg;
          break;

        case "AOL":
          tempImg.src = aolImg;
          break;

        default:
          tempImg.src = defaultImg;
          break;
      }
    }
  } else {
    setupDisplay();
  }
}

function updateLeaderBoard() {
  if (!isObjEmpty(racerArray)) {
    //sort the racerArray by total time
    racerArray.sort(function (a, b) {
      return a.total_time - b.total_time || a.car - b.car;
    })

    //let's create the leader board table
    var tableOut = "<table>";
    tableOut += "<tr><th>Car<br/>#</th><th>Racer Name</th><th>Racer<br/>Rank</th><th>Total<br/>Time (s)</th></tr>";

    for (var i = 0; i < racerArray.length; i++) {
      tableOut += `<tr><td>${racerArray[i].car}</td>`;
      tableOut += `<td>${racerArray[i].racer_name}</td>`;
      tableOut += `<td>${racerArray[i].rank}</td>`;
      tableOut += `<td>${(racerArray[i].total_time).toFixed(4)}</td></tr>`;
    }
    tableOut += `</table>`

    leaderBoardDiv.innerHTML = tableOut;
  } else {
    leaderBoardDiv.innerHTML = "";
  }
}

function updateCurrentRound() {

  if (currentRoundDiv.style.display == "none") { currentRoundDiv.style.display == "" };

  if (!isObjEmpty(roundResults)) {
    var headerTxt1a = "<tr><th rowspan=2>Heat #</th>";
    var headerTxt1b = "";
    var headerTxt1c = "</tr>";
    var headerTxt2base = "<th>Car #</th><th>Heat Time</th>";
    var headerTxt2 = ""

    var tableOut = "<table>";

    //build the table header
    for (var i = 1; i <= numLanes; i++) {
      headerTxt1b += `<th colspan=2>Lane ${i}</th>`
      headerTxt2 += headerTxt2base;
    }
    tableOut += headerTxt1a + headerTxt1b + headerTxt1c;
    tableOut += `<tr>${headerTxt2}</tr>`;

    for (var h = 0; h < numHeats * 1; h++) {  // h is the heat #
      tableOut += `<tr><td>${(h + 1)}</td>`;
      for (var l = 0; l < numLanes; l++) {             // l is the lane #
        if (roundResults[currentRndNum - 1][l][h].car !== "-") {
          tableOut += `<td>${roundResults[currentRndNum - 1][l][h].car}</td><td>${(roundResults[currentRndNum - 1][l][h].heat_time).toFixed(4)}</td>`;
        } else {
          tableOut += `<td>No Racer</td><td>-</td>`;
        }
      }
      tableOut += "</tr>";
    }
    tableOut += "</table>";
    currentRoundDiv.innerHTML = tableOut;
  } else {
    currentRoundDiv.innerHTML = "";
  }
}

function IndexByKeyValue(arraytosearch, key, valuetosearch) {
  for (var i = 0; i < arraytosearch.length; i++) {
    if (arraytosearch[i][key] == valuetosearch) {
      return i;
    }
  }
  return null;
};

function showTxt(e) {
  document.getElementById(e).style.visibility = "visible";
};

function hideTxt(e) {
  document.getElementById(e).style.visibility = "hidden";
};

function isObjEmpty(obj) {
  for (var x in obj) { if (obj.hasOwnProperty(x)) return false; }
  return true;
}

function showResults() {
  //console.log(`Winners stored: ${raceInfo.hasOwnProperty("winners")}`);
  if (raceInfo.hasOwnProperty("winners")) {
    //console.log('Calling winnerCards with raceInfo.winners from showResults()')
    winnerCards(JSON.parse(JSON.stringify(raceInfo.winners)));
  } else {
    //console.log('Calling winnerCards empty from showResults()')
    winnerCards();
  }
  updateLeaderBoard();

  // generate output for each round and heat
  //var resultsDiv = document.getElementById("current-round");
  var resultsTxtOut = "";

  var headerTxt1a = "<tr><th rowspan=2>Heat #</th>";
  var headerTxt1b = "";
  var headerTxt1c = "</tr>";
  var headerTxt2base = "<th>Car #</th><th>Heat Time</th>";
  var headerTxt2 = "";


  //let's load the data from the main file into a temp variable;
  //just use roundResults as data has already been loaded;
  //var resultsTmp = JSON.parse(JSON.stringify(raceInformation.heat_results));

  //build the table header for each round
  for (var l = 1; l <= numLanes; l++) {
    headerTxt1b += `<th colspan=2>Lane ${l}</th>`
    headerTxt2 += headerTxt2base;
  }
  //now loop through the array and generate the output
  for (var r = 0; r < roundResults.length; r++) {
    resultsTxtOut += `<H2>Round: ${r + 1}</h2>`;
    resultsTxtOut += `<table>${headerTxt1a}${headerTxt1b}${headerTxt1c}<tr>${headerTxt2}</tr>`

    for (var h = 0; h < roundResults[r][0].length; h++) {
      resultsTxtOut += `<tr><td>${(h + 1)}</td>`;

      for (var l = 0; l < numLanes; l++) {
        //console.log(`Round ${r} - Heat ${h} - Lane ${l}`);
        if (roundResults[r][l][h].car !== "-") {
          resultsTxtOut += `<td>${roundResults[r][l][h].car}</td><td>${roundResults[r][l][h].heat_time}</td>`;
        } else {
          resultsTxtOut += `<td>No Racer</td><td>-</td>`;
        }

      }
      resultsTxtOut += "</tr>"
    }
    resultsTxtOut += `</table>`;
  }

  currentRoundDiv.innerHTML = resultsTxtOut;

}

function clearObject(Obj) {
  for (var j in Obj) {
    if (Obj.hasOwnProperty(j)) {
      delete Obj[j];
    };
  }
  if (Obj.length > 0) {
    Obj.length = 0;
  }
}