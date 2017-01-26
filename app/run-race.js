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
function setupRace() {
  currentHeatNum = 1;
  currentRnd = 1;

  //load an array with just the included racerStats

  for (var i = 0; i < includedRacers.length; i++) {
    raceRacers[i] = {};

    for (var keys in racerStats[includedRacers[i]]) {
      raceRacers[i][keys] = racerStats[includedRacers[i]][keys];
    }
  }

  laneLineup = generateRound(includedRacers.length, numLanes, currentRnd, raceRacers);
  console.log(laneLineup);
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
    console.log(order);
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
    
    for (var i = 0; i < nLanes; i++) {
      sortLane[i].sort(function (a, b) {
        return a.Time - b.Time;
      })
    }
    console.log(sortLane);
    /*var SortLane1 = [];
    var SortLane2 = [];
    var SortLane3 = [];
    for (var i = 0; i < Lane1.length; i++) {
      if (racerArray[Lane1[i]] != null) {
        SortLane1.push({ Record: Lane1[i], Time: racerArray[Lane1[i]].total_time });
      } else {
        SortLane1.push({ Record: Lane1[i], Time: 1000 });
      };
    };
    bubbleSort(SortLane1, 'Time');

    for (var i = 0; i < Lane1.length; i++) {
      Lane1[i] = SortLane1[i].Record;
    };

    for (var i = 0; i < Lane2.length; i++) {
      if (TigerArray[Lane2[i]] != null) {
        SortLane2.push({ Record: Lane2[i], Time: TigerArray[Lane2[i]].TimeT });
      } else {
        SortLane2.push({ Record: Lane2[i], Time: 1000 });
      };
    };
    bubbleSort(SortLane2, 'Time');

    for (var i = 0; i < Lane2.length; i++) {
      Lane2[i] = SortLane2[i].Record;
    };

    for (var i = 0; i < Lane3.length; i++) {
      if (TigerArray[Lane3[i]] != null) {
        SortLane3.push({ Record: Lane3[i], Time: TigerArray[Lane3[i]].TimeT });
      } else {
        SortLane3.push({ Record: Lane3[i], Time: 1000 });
      };
    };
    bubbleSort(SortLane3, 'Time');

    for (var i = 0; i < Lane3.length; i++) {
      Lane3[i] = SortLane3[i].Record;
    };*/
  };
  return true;
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
