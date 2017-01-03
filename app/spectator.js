var TigerArray = [];

var Lanes = 3;
var NumRacers = 0;
var Lane1 = [];
var Lane2 = [];
var Lane3 = [];
var currentHeatNum = "";
var CurrentRnd = 0;
var roundResults = [];
var NumHeats = 0;

function setupRace() {
    document.getElementById("Lane1Time").value = " ";
    document.getElementById("Lane2Time").value = " ";
    document.getElementById("Lane3Time").value = " ";
    currentHeatNum = 1;
    CurrentRnd = 1;

    generateRound(NumRacers, Lanes, CurrentRnd);
    createRoundTable(Lane1, Lane2, Lane3, "CurrentRound");

    setDisplay(currentHeatNum, Lane1, Lane2, Lane3, "Lane1C", "Lane2C", "Lane3C");

    hideTxt("Lane1Place");
    hideTxt("Lane2Place");
    hideTxt("Lane3Place");
};

function nextRace() {
    currentHeatNum = currentHeatNum + 1;
    //alert (NumHeats + " " + currentHeatNum + " " + CurrentRnd);
    if (currentHeatNum > NumHeats) {
        currentHeatNum = 1;
        //alert("Adding to CurrentRnd");
        CurrentRnd = CurrentRnd + 1;
        //alert(CurrentRnd);
        if (CurrentRnd == 4) {
            hideTxt("Lane1Place");
            hideTxt("Lane2Place");
            hideTxt("Lane3Place");
            finishRace();
        } else {
            generateRound(NumRacers, Lanes, CurrentRnd);
            createRoundTable(Lane1, Lane2, Lane3, "CurrentRound");

            document.getElementById("RoundNo").innerHTML = "Round #" + CurrentRnd;
            document.getElementById("HeatNo").innerHTML = "Heat #" + currentHeatNum;
            setDisplay(currentHeatNum, Lane1, Lane2, Lane3, "Lane1C", "Lane2C", "Lane3C");

            hideTxt("Lane1Place");
            hideTxt("Lane2Place");
            hideTxt("Lane3Place");
        };
    } else {
        //document.getElementById("RoundNo").innerHTML = "Round #" + CurrentRnd;
        document.getElementById("HeatNo").innerHTML = "Heat #" + currentHeatNum;
        hideTxt("Lane1Place");
        hideTxt("Lane2Place");
        hideTxt("Lane3Place");
        setDisplay(currentHeatNum, Lane1, Lane2, Lane3, "Lane1C", "Lane2C", "Lane3C");
    };
};

function finishRace() {

    bubbleSort(TigerArray, "TimeT");
    document.getElementById("HeatNo").style.display = "none";
    hideTxt("HeatResults");
    document.getElementById("RoundNo").innerHTML = "Final Race!";
    //document.getElementByID("RoundNo").style = "text-align: center; font-size: 30pt;";
    var NameRacer = [];
    var CarNum = [];
    var TotalTime = [];
    var CarWt = [];
    var RacerRank = [];

    for ( var i = 0; i < 3; i++) {
        NameRacer[i] = TigerArray[i].Name;
        CarNum[i] = TigerArray[i].Car;
        TotalTime[i] = TigerArray[i].TimeT;
        CarWt[i] = TigerArray[i].CarW;
        RacerRank[i] = TigerArray[i].Rank;
    };

    switch (RacerRank[0]) {
        case "Tiger":
            var racerImg1 = "pictures/tiger.jpg";
            break;
        case "Wolf":
            var racerImg1 = "pictures/wolf.jpg";
            break;
        case "Bear":
            var racerImg1 = "pictures/bear.jpg";
            break;
        case "Webelos":
            var racerImg1 = "pictures/webelos.jpg";
            break;
        case "AOL":
            var racerImg1 = "pictures/aol2.jpg";
            break;
        case "none":
            var racerImg1 = "pictures/blank.jpg";
            break;
    };

    switch (RacerRank[1]) {
        case "Tiger":
            var racerImg2 = "pictures/tiger.jpg";
            break;
        case "Wolf":
            var racerImg2 = "pictures/wolf.jpg";
            break;
        case "Bear":
            var racerImg2 = "pictures/bear.jpg";
            break;
        case "Webelos":
            var racerImg2 = "pictures/webelos.jpg";
            break;
        case "AOL":
            var racerImg2 = "pictures/aol2.jpg";
            break;
        case "none":
            var racerImg2 = "pictures/blank.jpg";
            break;
    };

    switch (RacerRank[2]) {
        case "Tiger":
            var racerImg3 = "pictures/tiger.jpg";
            break;
        case "Wolf":
            var racerImg3 = "pictures/wolf.jpg";
            break;
        case "Bear":
            var racerImg3 = "pictures/bear.jpg";
            break;
        case "Webelos":
            var racerImg3 = "pictures/webelos.jpg";
            break;
        case "AOL":
            var racerImg3 = "pictures/aol2.jpg";
            break;
        case "none":
            var racerImg3 = "pictures/blank.jpg";
            break;
    };
    var out1 = NameRacer[0] + "<br>#" + CarNum[0] + "<br> Total Time: " + TotalTime[0].toFixed(4) + " min<br> Car Weight: " + CarWt[0] + " oz";
    document.getElementById("Lane1C").innerHTML = out1;
    var ID1 = "img" + "Lane1C";
    document.getElementById(ID1).src = racerImg1;
    showTxt("Lane1C");

    var out2 = NameRacer[1] + "<br>#" + CarNum[1] + "<br> Total Time: " + TotalTime[1].toFixed(4) + " min<br> Car Weight: " + CarWt[1] + " oz";
    document.getElementById("Lane2C").innerHTML = out2;
    var ID2 = "img" + "Lane2C";
    document.getElementById(ID2).src = racerImg2;
    showTxt("Lane2C");

    var out3 = NameRacer[2] + "<br>#" + CarNum[2] + "<br> Total Time: " + TotalTime[2].toFixed(4) + " min<br> Car Weight: " + CarWt[2] + " oz";
    document.getElementById("Lane3C").innerHTML = out3;
    var ID3 = "img" + "Lane3C";
    document.getElementById(ID3).src = racerImg3;
    showTxt("Lane3C");

    finalResults(TigerArray, "CurrentRound");


};

function finalResults(arr, id) {
    var out = "";
    var header1 = "<table id='tableRound'><tr><th>Place</th><th>Name</th><th>Car Number</th><th>Total Time (min)</th><th>Car Weight (oz)</th><th>Rank</th></tr>\n";

    var footer = "</table><p> </p>";

    for (var i = 0; i < arr.length; i++) {
        out = out + "<tr><td>" + (i + 1) + "</td><td>" + arr[i].Name + "</td><td>" + arr[i].Car + "</td><td>" + arr[i].TimeT + "</td><td>" + arr[i].CarW + "</td><td>" + arr[i].Rank + "</td></tr>\n";
    };
    document.getElementById(id).innerHTML = header1 + out + footer;

};

function updateResults() {
    var Lane1T = document.getElementById("Lane1Time").value;
    var Lane2T = document.getElementById("Lane2Time").value;
    var Lane3T = document.getElementById("Lane3Time").value;
    var HNum = currentHeatNum - 1;

    if (TigerArray[Lane1[HNum]] != null) {
        TigerArray[Lane1[HNum]].TimeS = TigerArray[Lane1[HNum]].TimeS + Lane1T + ",";
        TigerArray[Lane1[HNum]].TimeT = parseFloat(TigerArray[Lane1[HNum]].TimeT) + parseFloat(Lane1T);
        var CarNum1 = TigerArray[Lane1[HNum]].Car;
    } else {
        var CarNum1 = "No Racer";
    };
    if (TigerArray[Lane2[HNum]] != null) {
        TigerArray[Lane2[HNum]].TimeS = TigerArray[Lane2[HNum]].TimeS + Lane2T + ",";
        TigerArray[Lane2[HNum]].TimeT = parseFloat(TigerArray[Lane2[HNum]].TimeT) + parseFloat(Lane2T);
        var CarNum2 = TigerArray[Lane2[HNum]].Car;
    } else {
        var CarNum2 = "No Racer";
    };
    if (TigerArray[Lane3[HNum]] != null) {
        TigerArray[Lane3[HNum]].TimeS = TigerArray[Lane3[HNum]].TimeS + Lane3T + ",";
        TigerArray[Lane3[HNum]].TimeT = parseFloat(TigerArray[Lane3[HNum]].TimeT) + parseFloat(Lane3T);
        var CarNum3 = TigerArray[Lane3[HNum]].Car;
    } else {
        var CarNum3 = "No Racer";
    };

    roundResults[HNum] = [CarNum1, Lane1T, CarNum2, Lane2T, CarNum3, Lane3T];
    updateTable(roundResults, "CurrentRound");
    var tempHeatResults = [];

    if (CarNum1 != "No Racer") {
        tempHeatResults.push({ Lane: 1, Time: Lane1T });
    };
    if (CarNum2 != "No Racer") {
        tempHeatResults.push({ Lane: 2, Time: Lane2T });
    };
    if (CarNum3 != "No Racer") {
        tempHeatResults.push({ Lane: 3, Time: Lane3T });
    };
    for (var i = 0; i < tempHeatResults.length; i++) {
        //alert(tempHeatResults[i].Time);
    }
    bubbleSort(tempHeatResults, 'Time');
    var tempID = [];

    for (var i = 0; i < tempHeatResults.length; i++) {
        tempID[i] = "Lane" + tempHeatResults[i].Lane + "Place";
        //alert (tempID[i]);
    };

    for (var i = 0; i < tempID.length; i++) {
        if (i == 0) {
            document.getElementById(tempID[i]).innerHTML = "1st";
            showTxt(tempID[i]);
        };
        if (i == 1) {
            document.getElementById(tempID[i]).innerHTML = "2nd";
            showTxt(tempID[i]);
        };
        if (i == 2) {
            document.getElementById(tempID[i]).innerHTML = "3rd";
            showTxt(tempID[i]);
        };
    };
    document.getElementById("Lane1Time").value = " ";
    document.getElementById("Lane2Time").value = " ";
    document.getElementById("Lane3Time").value = " ";

};

function updateTable(arr, id) {
    var out = "";
    var header1 = "<table id='tableRound'><tr><th rowspan=2>Heat #</th><th colspan=2>Lane 1</th><th colspan=2>Lane 2</th><th colspan=2>Lane 3</th></tr>\n";
    var header2 = "<tr><th>Car #</th><th>Heat Time</th><th>Car #</th><th>Heat Time</th><th>Car #</th><th>Heat Time</th></tr>\n";
    var footer = "</table>";

    for (var i = 0; i < roundResults.length; i++) {
        out = out + "<tr><td>" + (i + 1) + "</td><td>" + roundResults[i][0] + "</td><td>" + roundResults[i][1] + "</td><td>" + roundResults[i][2] + "</td><td>" + roundResults[i][3] + "</td><td>" + roundResults[i][4] + "</td><td>" + roundResults[i][5] + "</td></tr>\n";
    };
    document.getElementById(id).innerHTML = header1 + header2 + out + footer;

};

function setDisplay(HNum, L1, L2, L3, Lane1ID, Lane2ID, Lane3ID) {
    if (TigerArray[L1[HNum - 1]] != null) {
        var NameRacer1 = TigerArray[L1[HNum - 1]].Name;
        var CarNum1 = TigerArray[L1[HNum - 1]].Car;
        var TotalTime1 = TigerArray[L1[HNum - 1]].TimeT;
        var CarWt1 = TigerArray[L1[HNum - 1]].CarW;
        var RacerRank1 = TigerArray[L1[HNum - 1]].Rank;
        TigerArray[L1[HNum - 1]].CurrentLane = "1";
        TigerArray[L1[HNum - 1]].Lane1 = "1";
    } else {
        var NameRacer1 = " ";
        var CarNum1 = " ";
        var TotalTime1 = " ";
        var CarWt1 = " ";
        var RacerRank1 = "none";
    };
    if (TigerArray[L2[HNum - 1]] != null) {
        var NameRacer2 = TigerArray[L2[HNum - 1]].Name;
        var CarNum2 = TigerArray[L2[HNum - 1]].Car;
        var TotalTime2 = TigerArray[L2[HNum - 1]].TimeT;
        var CarWt2 = TigerArray[L2[HNum - 1]].CarW;
        var RacerRank2 = TigerArray[L2[HNum - 1]].Rank;
        TigerArray[L2[HNum - 1]].CurrentLane = "2";
        TigerArray[L2[HNum - 1]].Lane2 = "1";
    } else {
        var NameRacer2 = " ";
        var CarNum2 = " ";
        var TotalTime2 = " ";
        var CarWt2 = " ";
        var RacerRank2 = "none";
    };
    if (TigerArray[L3[HNum - 1]] != null) {
        var NameRacer3 = TigerArray[L3[HNum - 1]].Name;
        var CarNum3 = TigerArray[L3[HNum - 1]].Car;
        var TotalTime3 = TigerArray[L3[HNum - 1]].TimeT;
        var CarWt3 = TigerArray[L3[HNum - 1]].CarW;
        var RacerRank3 = TigerArray[L3[HNum - 1]].Rank;
        TigerArray[L3[HNum - 1]].CurrentLane = "3";
        TigerArray[L3[HNum - 1]].Lane3 = "1";
    } else {
        var NameRacer3 = " ";
        var CarNum3 = " ";
        var TotalTime3 = " ";
        var CarWt3 = " ";
        var RacerRank3 = "none";
    };

    switch (RacerRank1) {
        case "Tiger":
            var racerImg1 = "pictures/tiger.jpg";
            break;
        case "Wolf":
            var racerImg1 = "pictures/wolf.jpg";
            break;
        case "Bear":
            var racerImg1 = "pictures/bear.jpg";
            break;
        case "Webelos":
            var racerImg1 = "pictures/webelos.jpg";
            break;
        case "AOL":
            var racerImg1 = "pictures/aol2.jpg";
            break;
        case "none":
            var racerImg1 = "pictures/blank.jpg";
            break;
    }

    switch (RacerRank2) {
        case "Tiger":
            var racerImg2 = "pictures/tiger.jpg";
            break;
        case "Wolf":
            var racerImg2 = "pictures/wolf.jpg";
            break;
        case "Bear":
            var racerImg2 = "pictures/bear.jpg";
            break;
        case "Webelos":
            var racerImg2 = "pictures/webelos.jpg";
            break;
        case "AOL":
            var racerImg2 = "pictures/aol2.jpg";
            break;
        case "none":
            var racerImg2 = "pictures/blank.jpg";
            break;
    }

    switch (RacerRank3) {
        case "Tiger":
            var racerImg3 = "pictures/tiger.jpg";
            break;
        case "Wolf":
            var racerImg3 = "pictures/wolf.jpg";
            break;
        case "Bear":
            var racerImg3 = "pictures/bear.jpg";
            break;
        case "Webelos":
            var racerImg3 = "pictures/webelos.jpg";
            break;
        case "AOL":
            var racerImg3 = "pictures/aol2.jpg";
            break;
        case "none":
            var racerImg3 = "pictures/blank.jpg";
            break;
    }

    if (NameRacer1 != " ") {
        var out1 = NameRacer1 + "<br>#" + CarNum1 + "<br> Total Time: " + TotalTime1 + " min<br> Car Weight: " + CarWt1 + " oz";
        document.getElementById(Lane1ID).innerHTML = out1;
        var ID1 = "img" + Lane1ID;
        document.getElementById(ID1).src = racerImg1;
        showTxt("Lane1C");
    } else {
        hideTxt("Lane1C");
        var ID1 = "img" + Lane1ID;
        document.getElementById(ID1).src = racerImg1;
    };
    if (NameRacer2 != " ") {
        var out2 = NameRacer2 + "<br>#" + CarNum2 + "<br> Total Time: " + TotalTime2 + " min<br> Car Weight: " + CarWt2 + " oz";
        document.getElementById(Lane2ID).innerHTML = out2;
        var ID2 = "img" + Lane2ID;
        document.getElementById(ID2).src = racerImg2;
        showTxt("Lane2C");
    } else {
        hideTxt("Lane2C");
        var ID2 = "img" + Lane2ID;
        document.getElementById(ID2).src = racerImg2;
    };
    if (NameRacer3 != " ") {
        var out3 = NameRacer3 + "<br>#" + CarNum3 + "<br> Total Time: " + TotalTime3 + " min<br> Car Weight: " + CarWt3 + " oz";
        document.getElementById(Lane3ID).innerHTML = out3;
        var ID3 = "img" + Lane3ID;
        document.getElementById(ID3).src = racerImg3;
        showTxt("Lane3C");
    } else {
        hideTxt("Lane3C");
        var ID3 = "img" + Lane3ID;
        document.getElementById(ID3).src = racerImg3;
    };

};

function generateRound(NRacers, NLanes, RndNo) {

    var Remainder = Number(NRacers % NLanes);
    var noLanes = Number(NLanes);

    if (Remainder == 0) {
        var Blank = 0;
    } else {
        var Blank = noLanes - Remainder;
    };

    NumHeats = (NRacers + Blank) / NLanes;

    //alert("Round Number: " + RndNo + "\n" + "Number of Rounds to run: " + NumRounds);
    if (RndNo == 1) {
        var order = genRandomNumArray(NumHeats * 3, 0, (NRacers + Blank - 1));
        var j = 0;
        for (var i = 0; i < order.length; i = i + 3) {
            Lane1[j] = order[i];
            //alert(order[i]);
            Lane2[j] = order[i + 1];
            //alert(order[i+1]);
            Lane3[j] = order[i + 2];
            //alert(order[i+2]);
            j++;
        }
    } else {
        var TempLane = [];
        for (i = 0; i < Lane3.length; i++) {
            //alert (Lane3[i]);
            TempLane[i] = Lane3[i];
            //alert ("New: "+ TempLane[i]);
        };
        for (i = 0; i < Lane2.length; i++) {
            //alert (Lane2[i]);
            Lane3[i] = Lane2[i];
            //alert ("New: "+ Lane3[i]);
        };
        for (i = 0; i < Lane1.length; i++) {
            //alert (Lane1[i]);
            Lane2[i] = Lane1[i];
            //alert ("New: "+ Lane2[i]);
        };
        for (i = 0; i < TempLane.length; i++) {
            //alert (TempLane[i]);
            Lane1[i] = TempLane[i];
            //alert ("New: "+ Lane1[i]);
        };
        var SortLane1 = [];
        var SortLane2 = [];
        var SortLane3 = [];
        for (var i = 0; i < Lane1.length; i++) {
            if (TigerArray[Lane1[i]] != null) {
                SortLane1.push({ Record: Lane1[i], Time: TigerArray[Lane1[i]].TimeT });
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
        };
    };
    //alert("Lane1 length= " + Lane1.length);
};

function createRoundTable(L1, L2, L3, id) {
    var out = "";
    var header1 = "<table id='tableRound'><tr><th rowspan=2>Heat #</th><th colspan=2>Lane 1</th><th colspan=2>Lane 2</th><th colspan=2>Lane 3</th></tr>\n";
    var header2 = "<tr><th>Car #</th><th>Heat Time</th><th>Car #</th><th>Heat Time</th><th>Car #</th><th>Heat Time</th></tr>\n";
    var footer = "</table>";
    var CarNumL1 = "";
    var CarNumL2 = "";
    var CarNumL3 = "";

    //debugging code ->
    //var dOut = "";
    //for (var i = 0; i < L1.length; i++) {
    //    dOut = dOut + "Heat" + i + ": " + L1[i] + " " + L2[i] + " " + L3[i] + "\n";
    //}
    //alert(dOut);

    for (var i = 0; i < L1.length; i++) {
        if (TigerArray[L1[i]] != null) {
            CarNumL1 = TigerArray[L1[i]].Car;
            //alert (i + " L1: " + CarNumL1);
            out = out + "<tr><td>" + (i + 1) + "</td><td>" + CarNumL1 + "</td><td>  </td>";
        } else {
            //alert ("L1 TigerArray null");
            CarNumL1 = 0;
            out = out + "<tr><td>" + (i + 1) + "</td><td>No Racer</td><td> </td>";
        };

        if (TigerArray[L2[i]] != null) {
            CarNumL2 = TigerArray[L2[i]].Car;
            //alert (i + " L2: " + CarNumL2);
            out = out + "<td>" + CarNumL2 + "</td><td> </td>";
        } else {
            //alert ("L2 TigerArray null");
            CarNumL2 = 0;
            out = out + "<td>No Racer</td><td> </td>";
        };

        if (TigerArray[L3[i]] != null) {
            CarNumL3 = TigerArray[L3[i]].Car;
            //alert (i + " L3: " + CarNumL3);
            out = out + "<td>" + CarNumL3 + "</td><td> </td></tr>\n";
        } else {
            //alert ("L3 TigerArray null");
            CarNumL3 = 0;
            out = out + "<td>No Racer</td><td> </td></tr>\n";
        };
        roundResults[i] = [CarNumL1, 0, CarNumL2, 0, CarNumL3, 0];
        //alert("Lane 1 Heat " + (i+1) + " Car: " + CarNumL1);
    };

    document.getElementById(id).innerHTML = header1 + header2 + out + footer;
};

function genRandomNumArray(entries, min, max) {
    // parameters
    // how_many_number : how many numbers you want to generate. For example it is 5.
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

function shuffle(array) {
    var tmp, current, top = array.length;

    if (top) while (--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
    }

    return array;
};

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

function bubbleSort(a, par) {
    var swapped;
    do {
        swapped = false;
        for (var i = 0; i < a.length - 1; i++) {
            if (a[i][par] > a[i + 1][par]) {
                var temp = a[i];
                a[i] = a[i + 1];
                a[i + 1] = temp;
                swapped = true;
            }
        }
    } while (swapped);
};