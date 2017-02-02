var laneLineup = [];
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

function updateRaceTable() {
  var trOut = "";
  var racerTmpTable = document.getElementById("racer-table");

  trOut += "<tr><th>Car<br/>#</th><th>Racer Name</th><th>Racer<br/>Rank</th><th>Total<br/>Time (s)</th></tr>";

  for (var i = 0; i < includedRacers.length; i++) {
    trOut += `<tr><td>${racerStats[includedRacers[i]].car}</td>`;
    trOut += `<td>${racerStats[includedRacers[i]].racer_name}</td>`;
    trOut += `<td>${racerStats[includedRacers[i]].rank}</td>`;
    trOut += `<td>${racerStats[includedRacers[i]].total_time}</td></tr>`;
  }

  racerTmpTable.innerHTML = trOut;
}

function updateCurrentHeat (racerArray, laneArray, nLanes, currentHeatNo) {
  var heatTable = document.getElementById("heat-lane-assignments").getElementsByTagName("table");
  var tableOut = "";
  var headerTxt1 = `<th colspan="${nLanes*2}">Current Heat Lineup</th>`;
  var headerTxt2 = "";
  var headerTxt3base = "<th>Car #</th><th>Racer</th>";
  var headerTxt3 = "";

  //create the correct # of lanes in the table
  for (var i = 1; i <= nLanes; i++){
    headerTxt2 += `<th colspan="2">Lane ${i}</th>`
    headerTxt3 += headerTxt3base;
  }

  tableOut += `<tr>${headerTxt1}</tr>`;
  tableOut += `<tr>${headerTxt2}</tr>`;
  tableOut += `<tr>${headerTxt3}</tr>`;

  if (typeof racerArray == undefined || racerArray == null || racerArray.length == 0){
    heatTable[0].innerHTML = tableOut;
    
    return -1;
  }

  tableOut += `<tr>`;
  for (var i = 0; i < nLanes; i++) {
    tableOut += `<td>${racerArray[laneArray[i][(currentHeatNo - 1)]].car}</td><td>${racerArray[laneArray[i][(currentHeatNo - 1)]].racer_name}</td>`;
  }
  tableOut += `</tr>`;
  
  heatTable[0].innerHTML = tableOut;
  return 1;
}

function stopRace() {
  isRacing = false;

  //change the stop race button back to a start race button
  var startButton = document.getElementById("start-race");
  startButton.innerHTML = "Start Race";
  startButton.setAttribute("onclick","setupRace()");

  //re-enable all buttons in other tabs but the serial command send button
  var mainButtons = document.getElementById("mainT").getElementsByTagName("button");
  disableButtons(mainButtons);

  var testButtons = document.getElementById("testTrackT").getElementsByTagName("button");
  disableButtons(testButtons);
  disableButtons([document.getElementById("send-serial")]);

  var editButtons = document.getElementById("editRacersT").getElementsByTagName("button");
  disableButtons(editButtons);
  
}

function setupRace() {
  if (isObjEmpty(raceInformation)){
    alert("Please open/create a race file first before starting a race.");
    return -1;
  }

  currentHeatNum = 1;
  currentRnd = 1;
  isRacing = true;
  
  //change the start race button to a stop race button
  var startButton = document.getElementById("start-race");
  startButton.innerHTML = "Stop Race";
  startButton.setAttribute("onclick","stopRace()");

  //disable all buttons in other tabs but the serial command send button
  var mainButtons = document.getElementById("mainT").getElementsByTagName("button");
  disableButtons(mainButtons);

  var testButtons = document.getElementById("testTrackT").getElementsByTagName("button");
  disableButtons(testButtons);
  disableButtons([document.getElementById("send-serial")]);

  var editButtons = document.getElementById("editRacersT").getElementsByTagName("button");
  disableButtons(editButtons);
  clearDisplay();


  //load an array with just the included racerStats

  for (var i = 0; i < includedRacers.length; i++) {
    raceRacers[i] = {};

    for (var keys in racerStats[includedRacers[i]]) {
      raceRacers[i][keys] = racerStats[includedRacers[i]][keys];
    }
  }

  //generate the round and store in an array
  laneLineup = generateRound(includedRacers.length, numLanes, currentRnd, raceRacers);
  //console.log(laneLineup);
  roundResults = updateRoundTable(laneLineup, raceRacers, roundResults, currentRnd, currentHeatNum, numLanes);

  //setDisplay(currentHeatNum, Lane1, Lane2, Lane3, "Lane1C", "Lane2C", "Lane3C");

  //hideTxt("Lane1Place");
  //hideTxt("Lane2Place");
  //hideTxt("Lane3Place");
};

function updateRoundTable (laneArray, racerArray, roundArray, RndNo, HeatNo, nLanes) {
  /*
  laneArray - nested array created by generateRound() with lane order by heat
  racerArray - main array of objects with all of the main racer information including cumlative time, rank, car #, and name
  roundArray - nested array to store results from each heat - each entry is an array with [Car,Time]<sub>n</sub> entries where n is the number of lanes
  RndNo - current round number
  HeatNo - current heat number
  nLanes - number of lanes
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
  for (var i = 1; i <= nLanes; i++){
    headerTxt1b += `<th colspan=2>Lane ${i}</th>`
    headerTxt2 += headerTxt2base;
  }
  tempOut += headerTxt1a + headerTxt1b + headerTxt1c;
  tempOut += `<tr>${headerTxt2}</tr>`;
  
  if (HeatNo === 1){  // initial setup 
    for(var i = 0; i < laneArray[0].length; i ++){  // i is the heat #
      tempOut += `<tr><td>${(i + 1)}</td>`;
      roundArray[i] = [];                           // initialize the array to hold the results for each heat
      for (var j = 0; j < nLanes; j++){             // j is the lane #
        if (!isObjEmpty(racerArray[laneArray[j][i]])) {
          tempOut += `<td>${racerArray[laneArray[j][i]].car}</td><td>0.0000</td>`;
          roundArray[i].push(racerArray[laneArray[j][i]].car);
          roundArray[i].push(0);
        } else {
          tempOut += `<td>No Racer</td><td> </td>`;
          roundArray[i].push(0);
          roundArray[i].push(0);
        }
      }
      tempOut += "</tr>";
    }
    updateCurrentHeat(racerArray, laneArray,nLanes,HeatNo);
  } else {  //now deal with later heats

  }

  roundTable.innerHTML = tempOut;
  return roundArray;
}

function generateRound(nRacers, nLanes, RndNo, racerArray, laneArray) {
  var laneOrder = [];
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
    //console.log(order);
    var j = 0;

    for (var i = 0; i < nLanes; i++) {
      laneOrder[i] = [];
    }

    for (var i = 0; i < order.length; i = i + nLanes) {
      for (var x = 0; x < nLanes; x++) {
        laneOrder[x][j] = order[i + x]
      }
      j++;
    }
    return laneOrder;
  } else {
    //after first round, we need to swap lanes so each racers races on each lane, then we need
    //to sort the lanes so that the fastest cars are at the top for the next round
    var TempLane = [];
    //if the lane array was not passed return with an error
    if (laneArray === undefined) {
      return false;
    }

    //swap the lanes
    for (var i = 0; i < laneArray.length; i++) {
      if (i === 0) {
        TempLane = laneArray[i].slice();
        laneArray[i] = laneArray[i + 1].slice();
      } else if (i === (laneArray.length - 1)) {
        laneArray[i] = TempLane.slice();
      } else {
        laneArray[i] = laneArray[i + 1].slice();
      };
    }

    //now let's do the sorting but first we need to create a temporary array with times;
    var sortLane = [];
    for (var i = 0; i < nLanes; i++) {
      sortLane[i] = [];
      for (var j = 0; j < laneArray[i].length; j++) {
        if (racerArray[laneArray[i][j]] != null) {
          sortLane[i].push({ Record: laneArray[i][j], Time: racerArray[laneArray[i][j]].total_time });
        } else {
          sortLane[i].push({ Record: laneArray[i][j], Time: 1000.5 });
        };
      };

    }
    // now do the sorting
    for (var i = 0; i < nLanes; i++) {
      sortLane[i].sort(function (a, b) {
        return a.Time - b.Time;
      })
    }
    //now put the sorted order back into laneArray
    for (var i = 0; i < nLanes; i++){
      for (var j = 0; j < laneArray[i].length; j++){
        laneArray[i][j] = sortLane[i][j].Record;
      }
    }
    return laneArray;
  }
};

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
};

function disableButtons(buttonArr){
  for (var i = 0; i < buttonArr.length; i++){
    buttonArr[i].disabled === false ? buttonArr[i].disabled = true : buttonArr[i].disabled = false;
  }
}

function postResults(raceTimes){
  console.log(raceTimes);
}