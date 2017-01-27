var Lane1 = [];
var Lane2 = [];
var Lane3 = [];
var laneLineup = [];
var currentHeatNum = 0;
var currentRnd = 0;
var roundResults = [];
var NumHeats = 0;
var raceRacers = [];

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
function updateCurrentHeat (racerArray,nLanes) {
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

  //console.log(tableOut);

  if (typeof racerArray == undefined || racerArray == null || racerArray.length == 0){
    heatTable[0].innerHTML = tableOut;
    //console.log(heatTable[0]);
    return -1;
  }
  tableOut += `<tr>`;
  for (var i = 0; i < racerArray.length; i++) {
    tableOut += `<td>${racerArray[i].car}</td><td>${racerArray[i].racer_name}</td>`;
  }
  tableOut += `</tr>`;
  //console.log(tableOut);
  //console.log(heatTable);

  heatTable[0].innerHTML = tableOut;
  return 1;

}

function setupRace() {
  currentHeatNum = 1;
  currentRnd = 1;
  
  var mainButtons = document.getElementById("mainT").getElementsByTagName("button");
  disableButtons(mainButtons);

  var testButtons = document.getElementById("testTrackT").getElementsByTagName("button");
  disableButtons(testButtons);
  disableButtons([document.getElementById("send-serial")]);

  var editButtons = document.getElementById("editRacersT").getElementsByTagName("button");
  disableButtons(editButtons);


  //load an array with just the included racerStats

  for (var i = 0; i < includedRacers.length; i++) {
    raceRacers[i] = {};

    for (var keys in racerStats[includedRacers[i]]) {
      raceRacers[i][keys] = racerStats[includedRacers[i]][keys];
    }
  }

  laneLineup = generateRound(includedRacers.length, numLanes, currentRnd, raceRacers);
  //console.log(laneLineup);
  //createRoundTable(Lane1, Lane2, Lane3, "CurrentRound");

  //setDisplay(currentHeatNum, Lane1, Lane2, Lane3, "Lane1C", "Lane2C", "Lane3C");

  //hideTxt("Lane1Place");
  //hideTxt("Lane2Place");
  //hideTxt("Lane3Place");
};

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