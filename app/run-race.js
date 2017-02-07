var laneLineup = [];
var raceResults = [];
var currentHeatNum = 0;
var currentRnd = 0;
var roundResults = [];
var NumHeats = 0;
var raceRacers = [];
var isRacing = false;

function specWin(command) {
  //console.log(`Sending to main command: ${command}`);
  ipcRenderer.send('spectator-window', command);
}

function stopRace() {
  var resp = confirm("Are you sure you want to stop the race?  All results will be deleted.");
  if (!resp) { return -1 };

  isRacing = false;

  //change the stop race button back to a start race button
  var startButton = document.getElementById("start-race");
  startButton.innerHTML = "Start Race";
  startButton.setAttribute("onclick", "setupRace()");

  var heatButton = document.getElementById("heat-button");
  var redoHeatButton = document.getElementById("redo-heat");
  var saveResultsButton = document.getElementById("save-results");

  disableButtons([heatButton, redoHeatButton, saveRaceButton]);


  //re-enable all buttons in other tabs but the serial command send button
  var mainButtons = document.getElementById("mainT").getElementsByTagName("button");
  disableButtons(mainButtons);

  var testButtons = document.getElementById("testTrackT").getElementsByTagName("button");
  disableButtons(testButtons);
  disableButtons([document.getElementById("send-serial")]);

  var editButtons = document.getElementById("editRacersT").getElementsByTagName("button");
  disableButtons(editButtons);

  clearDisplay();
  clearObject(raceRacers);
  clearObject(raceResults);
  updateRacerTable();
  var heatTable = document.getElementById("heat-lane-assignments").getElementsByTagName("table");
  heatTable[0].innerHTML = "";

  var roundTxt = document.getElementById("current-round-number");
  var heatTxt = document.getElementById("current-heat-number");
  var roundTable = document.getElementById("round-lineup-table");

  roundTxt.innerHTML = "";
  heatTxt.innerHTML = "";
  roundTable.innerHTML = "";

}

function setupRace() {
  if (isObjEmpty(raceInformation)) {
    alert("Please open/create a race file first before starting a race.");
    return -1;
  }

  currentHeatNum = 1;
  currentRnd = 1;
  isRacing = true;

  var heatButton = document.getElementById("heat-button");
  var redoHeatButton = document.getElementById("redo-heat");
  var saveRaceButton = document.getElementById("save-results");

  disableButtons([heatButton, redoHeatButton, saveRaceButton]);

  //change the start race button to a stop race button
  var startButton = document.getElementById("start-race");
  startButton.innerHTML = "Stop Race";
  startButton.setAttribute("onclick", "stopRace()");

  //disable all buttons in other tabs but the serial command send button
  var mainButtons = document.getElementById("mainT").getElementsByTagName("button");
  disableButtons(mainButtons);

  var testButtons = document.getElementById("testTrackT").getElementsByTagName("button");
  disableButtons(testButtons);
  disableButtons([document.getElementById("send-serial")]);

  var editButtons = document.getElementById("editRacersT").getElementsByTagName("button");
  disableButtons(editButtons);
  clearDisplay();

  //generate the round and store in an array
  generateRound(includedRacers.length, numLanes, currentRnd, raceRacers);

  updateRoundTable(raceResults, currentRnd, currentHeatNum, numLanes, NumHeats);
  updateCurrentHeat(raceResults, currentRnd, numLanes, currentHeatNum);

}

function generateRound(nRacers, nLanes, RndNo, racerArray) {
  /*
  nRacers - number of racers in race
  nLanes - number of lanes on track
  RndNo - current round number
  racerArray - array containing only the racers in the race - follows the same structure as racerStats
  */

  var Remainder = (nRacers * 1) % (nLanes * 1);

  if (Remainder == 0) {
    var Blank = 0;
  } else {
    var Blank = (nLanes * 1) - Remainder;
  };

  NumHeats = ((nRacers * 1) + (Blank * 1)) / (nLanes * 1);

  //if it is the first round, then we have to do some initial setup
  if (RndNo == 1) {
    var order = genRandomNumArray((NumHeats * nLanes), 0, (nRacers + Blank - 1));

    //make sure the array is empty
    clearObject(raceResults);

    //initialize the array
    raceResults[RndNo * 1 - 1] = [];
    for (var l = 0; l < nLanes; l++) { // # of lanes
      raceResults[RndNo * 1 - 1][l] = [];
      for (var h = 0; h < NumHeats; h++) { // # of heats
        raceResults[RndNo * 1 - 1][l][h] = {};
      }
    }

    //fill the array
    var j = 0; // j is heat #
    for (var i = 0; i < order.length; i = i + nLanes * 1) {
      for (var x = 0; x < nLanes; x++) {  // x is the lane #
        if (!isObjEmpty(racerArray[order[i + x]])) {
          raceResults[RndNo * 1 - 1][x][j].car = racerArray[order[i + x]].car;
          raceResults[RndNo * 1 - 1][x][j].racer_name = racerArray[order[i + x]].racer_name;
          raceResults[RndNo * 1 - 1][x][j].total_time = racerArray[order[i + x]].total_time;
          raceResults[RndNo * 1 - 1][x][j].heat_time = 0;
          raceResults[RndNo * 1 - 1][x][j].heat_lane = x;
          raceResults[RndNo * 1 - 1][x][j].race_index = order[i + x];
          raceResults[RndNo * 1 - 1][x][j].main_index = checkKeyValue(racerStats, "car", raceRacers[order[i + x]].car);
        } else {
          raceResults[RndNo * 1 - 1][x][j].car = "-";
          raceResults[RndNo * 1 - 1][x][j].racer_name = "No Racer";
          raceResults[RndNo * 1 - 1][x][j].total_time = 0;
          raceResults[RndNo * 1 - 1][x][j].heat_time = 0;
          raceResults[RndNo * 1 - 1][x][j].heat_lane = x;
          raceResults[RndNo * 1 - 1][x][j].race_index = 99;
          raceResults[RndNo * 1 - 1][x][j].main_index = 99;
        }
      }
      j++;
    }
  } else {
    //after first round, we need to swap lanes so each racers races on each lane, then we need
    //to sort the lanes so that the fastest cars are at the top for the next round
    raceResults[RndNo - 1] = [];

    // swap the lane arrays from the old round [RndNo-2] into the new round array [RndNo-1]
    var l = 0;
    for (var i = 0; i < nLanes; i++) {
      if ((i + 1) == nLanes) {
        l = 0;
      } else {
        var l = i + 1;
      }
      raceResults[RndNo - 1][l] = JSON.parse(JSON.stringify(raceResults[RndNo - 2][i].slice()));
    }
    // now let's sort the new round array lanes by total_time
    for (var l = 0; l < nLanes; l++) {
      raceResults[RndNo - 1][l].sort(function (a, b) {
        return a.total_time - b.total_time;
      })
    }

    // now reset the lane # and heat time for each car
    for (var l = 0; l < nLanes; l++) {
      for (var h = 0; h < NumHeats; h++) {
        raceResults[RndNo - 1][l][h].heat_lane = l;
        raceResults[RndNo - 1][l][h].heat_time = 0;
      }
    }
  }
}

function updateRoundTable(resultsArr, RndNo, HeatNo, nLanes, numberHeats) {
  /*
  resultsArr - nested array created by generateRound() with [round][lane][heat] plus object with
  {car, racer_name, total_time, heat_time, heat_lane, race_index, main_index}
      - race_index is the index of the entry in raceRacers array
      - main_index is the index of the entry in the racerStats array
  RndNo - current round number
  HeatNo - current heat number
  nLanes - number of lanes
  numberHeats - number of heats in round
  */
  var roundTxt = document.getElementById("current-round-number");
  var heatTxt = document.getElementById("current-heat-number");
  var roundTable = document.getElementById("round-lineup-table");
  var headerTxt1a = "<tr><th rowspan=2>Heat #</th>";
  var headerTxt1b = "";
  var headerTxt1c = "</tr>";
  var headerTxt2base = "<th>Car #</th><th>Heat Time</th>";
  var headerTxt2 = ""

  var tempOut = "";

  //set the round and heat
  roundTxt.innerHTML = RndNo;
  heatTxt.innerHTML = HeatNo;

  //build the table header
  for (var i = 1; i <= nLanes; i++) {
    headerTxt1b += `<th colspan=2>Lane ${i}</th>`
    headerTxt2 += headerTxt2base;
  }
  tempOut += headerTxt1a + headerTxt1b + headerTxt1c;
  tempOut += `<tr>${headerTxt2}</tr>`;

  for (var h = 0; h < numberHeats * 1; h++) {  // h is the heat #
    tempOut += `<tr><td>${(h + 1)}</td>`;
    for (var l = 0; l < nLanes; l++) {             // l is the lane #
      if (resultsArr[RndNo - 1][l][h].car !== "-") {
        tempOut += `<td>${resultsArr[RndNo - 1][l][h].car}</td><td>${resultsArr[RndNo - 1][l][h].heat_time}</td>`;
      } else {
        tempOut += `<td>No Racer</td><td>-</td>`;
      }
    }
    tempOut += "</tr>";
  }
  roundTable.innerHTML = tempOut;
}

function updateRacerTable() {
  var trOut = "";
  var racerTmpTable = document.getElementById("racer-table");

  //load an array with just the included racerStats
  if (isObjEmpty(raceRacers)) {
    for (var i = 0; i < includedRacers.length; i++) {
      raceRacers[i] = {};

      for (var keys in racerStats[includedRacers[i]]) {
        raceRacers[i][keys] = racerStats[includedRacers[i]][keys];
      }
    }
  }

  /* //let's sort the array by total_time
   raceRacers.sort(function (a,b){
     return a.total_time - b.total_time;
   });*/

  trOut += "<tr><th>Car<br/>#</th><th>Racer Name</th><th>Racer<br/>Rank</th><th>Total<br/>Time (s)</th></tr>";

  for (var i = 0; i < raceRacers.length; i++) {
    trOut += `<tr><td>${raceRacers[i].car}</td>`;
    trOut += `<td>${raceRacers[i].racer_name}</td>`;
    trOut += `<td>${raceRacers[i].rank}</td>`;
    trOut += `<td>${(raceRacers[i].total_time).toFixed(4)}</td></tr>`;
  }

  racerTmpTable.innerHTML = trOut;
}

function updateCurrentHeat(resultsArr, RndNo, nLanes, currentHeatNo) {
  var heatTable = document.getElementById("heat-lane-assignments").getElementsByTagName("table");
  var tableOut = "";
  var headerTxt1 = `<th colspan="${nLanes * 2}">Current Heat Lineup</th>`;
  var headerTxt2 = "";
  var headerTxt3base = "<th>Car #</th><th>Racer</th>";
  var headerTxt3 = "";

  //create the correct # of lanes in the table
  for (var i = 1; i <= nLanes; i++) {
    headerTxt2 += `<th colspan="2">Lane ${i}</th>`
    headerTxt3 += headerTxt3base;
  }

  tableOut += `<tr>${headerTxt1}</tr>`;
  tableOut += `<tr>${headerTxt2}</tr>`;
  tableOut += `<tr>${headerTxt3}</tr>`;

  if (typeof resultsArr == undefined || resultsArr == null || resultsArr.length == 0) {
    heatTable[0].innerHTML = tableOut;

    return -1;
  }

  tableOut += `<tr>`;
  for (var l = 0; l < nLanes; l++) {  // l is # of lanes
    tableOut += `<td>${resultsArr[RndNo - 1][l][currentHeatNo - 1].car}</td><td>${resultsArr[RndNo - 1][l][currentHeatNo - 1].racer_name}</td>`;
  }
  tableOut += `</tr>`;

  heatTable[0].innerHTML = tableOut;
  return 1;
}

function raceUpdate(type) {
  var heatButton = document.getElementById("heat-button");
  var redoHeatButton = document.getElementById("redo-heat");
  var saveResultsButton = document.getElementById("save-results");
  var startButton = document.getElementById("start-race");


  switch (type) {
    case "accept":
      disableButtons([redoHeatButton]);
      if (currentHeatNum !== NumHeats) {
        heatButton.innerHTML = "Next Heat";
        heatButton.setAttribute('onclick', "raceUpdate('next')");
      } else if (currentRnd !== 3) {
        heatButton.innerHTML = "Next Round";
        heatButton.setAttribute('onclick', "raceUpdate('next')");
      } else {
        heatButton.innerHTML = "Finish";
        heatButton.setAttribute('onclick', "raceUpdate('finish')");
      }

      for (var l = 0; l < numLanes; l++) {
        raceResults[currentRnd - 1][l][currentHeatNum - 1].heat_time = laneTimes[l].time * 1;
        raceResults[currentRnd - 1][l][currentHeatNum - 1].total_time += laneTimes[l].time * 1;
        if (raceResults[currentRnd - 1][l][currentHeatNum - 1].race_index != 99) {
          raceRacers[raceResults[currentRnd - 1][l][currentHeatNum - 1].race_index].total_time += laneTimes[l].time * 1;
        }
      }
      updateRacerTable();
      updateRoundTable(raceResults, currentRnd, currentHeatNum, numLanes, NumHeats);

      break;

    case "redo":
      clearDisplay();
      //resetArduino();

      break;

    case "next":
      clearDisplay();
      if (currentHeatNum !== NumHeats) {
        currentHeatNum++;
      } else if (currentRnd !== 3) {
        currentHeatNum = 1;
        currentRnd++;
        generateRound(raceRacers.length, numLanes, currentRnd, raceRacers);
      } else {
        currentRnd = 1;
        currentHeatNum = 1;
        return;
      }
      updateRacerTable();
      updateRoundTable(raceResults, currentRnd, currentHeatNum, numLanes, NumHeats);
      updateCurrentHeat(raceResults, currentRnd, numLanes, currentHeatNum);
      disableButtons([redoHeatButton]);
      heatButton.innerHTML = "Accept Heat Results";
      heatButton.setAttribute('onclick', "raceUpdate('accept')");

      break;

    case "finish":
      clearDisplay();
      startButton.innerHTML = "Start Race"
      startButton.setAttribute('onclick',"setupRace()");
      disableButtons([redoHeatButton, saveResultsButton, startButton]);


      break;

    default:
      break;
  }
}

function genRandomNumArray(entries, min, max) {
  // parameters
  // entries : how many numbers you want to generate. For example it is 5.
  // min(inclusive) : minimum/low value of a range. it must be any positive integer but less than max. i.e 4
  // max(inclusive) : maximun value of a range. it must be any positive integer. i.e 50
  // return type: array

  var random_number = [];
  for (var i = 0; i < entries; i++) {
    var gen_num = parseInt((Math.random() * (max - min + 1)) + min);
    do {
      var is_exist = random_number.indexOf(gen_num);
      if (is_exist >= 0) {
        gen_num = parseInt((Math.random() * (max - min + 1)) + min);
      }
      else {
        random_number.push(gen_num);
        is_exist = -2;
      }
    }
    while (is_exist > -1);
  }
  return random_number;
}

function disableButtons(buttonArr) {
  for (var i = 0; i < buttonArr.length; i++) {
    buttonArr[i].disabled === false ? buttonArr[i].disabled = true : buttonArr[i].disabled = false;
  }
}

function postResults(raceTimes) {
  //send results to spectator window
  console.log(raceTimes);
}

function simHeat(nLanes) {
  for (var i = 0; i < nLanes; i++) {
    var rndTime = ((Math.random() * 3) + 1).toFixed(4);

    if (currentTab == "testTrackT") {
      var tempLaneId = `tlane-lane${i + 1}`;
    } else {
      var tempLaneId = `race-lane-lane${i + 1}`;
    }

    if (laneMask[i] != 1) {
      document.getElementById(tempLaneId).innerHTML = rndTime;
      laneTimes[i] = { lane: (i + 1), time: rndTime * 1 };
    } else {
      laneTimes[i] = { lane: (i + 1), time: 99 };
    }
  }

  laneTimes.sort(function (a, b) {
    return a.time - b.time;
  })

  if (currentTab == "testTrackT") {
    if (nLanes > 2) {
      var winnerLane = [`tlane-lane${laneTimes[0].lane}-Li`, `tlane-lane${laneTimes[1].lane}-Li`, `tlane-lane${laneTimes[2].lane}-Li`];
    } else {
      var winnerLane = [`tlane-lane${laneTimes[0].lane}-Li`, `tlane-lane${laneTimes[1].lane}-Li`];
    }
  } else {
    if (nLanes > 2) {
      var winnerLane = [`race-lane-lane${laneTimes[0].lane}-Li`, `race-lane-lane${laneTimes[1].lane}-Li`, `race-lane-lane${laneTimes[2].lane}-Li`];
    } else {
      var winnerLane = [`race-lane-lane${laneTimes[0].lane}-Li`, `race-lane-lane${laneTimes[1].lane}-Li`,];
    }
  }
  //console.log(winnerLane);
  document.getElementById(winnerLane[0]).className = "winner1";
  document.getElementById(winnerLane[1]).className = "winner2";
  if (nLanes > 2) {
    document.getElementById(winnerLane[2]).className = "winner3";
  }
  if (currentTab == "testTrackT") {
    updateHistoryTable(laneTimes);
  }
  if (isRacing) {
    postResults(laneTimes);
  }
}