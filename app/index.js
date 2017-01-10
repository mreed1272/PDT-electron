const electron = require('electron');
const remote = electron.remote;
const dialog = electron.remote.dialog;
const shell = electron.shell;
const fs = require('fs');
const ipcRenderer = electron.ipcRenderer;

var SerialPort = require('serialport');

var PDT = null;

var lastSerialCommand = "";
var lastSerialResponse = "";
var laneMask = [];
var laneTimes = [];
var initArduino = false;
var initLane = false;
var numLanes = 2; //default to 2 lanes
var currentTab = "mainT";
var currentSessionDate = new Date();
var runNum = 1;
var lastRunTimes = [];
var racerStats = [];
var raceInformation = [];
var ranks = [];
var racerStatsFile = "";


var comPorts = [];

window.onclick = (event) => {
    if (event.target == document.getElementById("RaceInfoEditModal")) {
        document.getElementById("RaceInfoEditModal").style.display = "none";
    }
}

function onBodyLoad() {
    document.getElementById("mainT").style.display = "block";
    document.getElementById("RacerInfo").style.display = "none";
    initSerial();

    window.onclick = (event) => {
        if (event.target == document.getElementById("RaceInfoEditModal")) {
            document.getElementById("RaceInfoEditModal").style.display = "none";
        }
    }

}

function openTabContent(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("selected");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace("selected", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += "selected";
    currentTab = tabName;

    if (tabName == "testTrackT") {
        var tempSessionDate = currentSessionDate.toDateString();
        document.getElementById("test-date").innerHTML = tempSessionDate;
    }
}


function loadSelect(selectID, optListArr, selectItem) {
    var selElem = document.getElementById(selectID);
    //var option = document.createElement("option");

    for (var i = 0; i < optListArr.length; i++) {
        var option = document.createElement("option");
        option.text = optListArr[i];
        option.value = optListArr[i];
        selElem.add(option, i);
        if (optListArr[i].value == selectItem) {
            selElem.selectedIndex = i;
        }
    }
}

function initLanes(numLanes, ulId) {
    var selElem = document.getElementById(ulId);
    var liID = "";
    var liLane = null;
    var maskOut = "";
    //console.log(ulId);
    //console.log(selElem);
    for (var i = 1; i <= numLanes; i++) {
        liID = `${ulId}-lane${i}-Li`;
        //console.log(liID);
        var spanID = `${ulId}-lane${i}`;
        //console.log(spanID);
        liLane = document.createElement("li");

        liLane.id = liID;
        if (!initArduino && i === 1) {
            liLane.className = "winner1";
        }
        liLane.innerHTML = `Lane ${i}: <span class="LEDdisplay" id="${spanID}">0.0000</span> s`;
        //console.log(liLane);
        selElem.appendChild(liLane);
    }
    liID = `${ulId}-mask-Li`;
    liLane = document.createElement("li");
    liLane.id = liID;
    liLane.className = "laneMask";
    maskOut = "Mask Lanes: <br/>";
    for (var i = 1; i <= numLanes; i++) {
        maskOut += ` Lane ${i} <input type="checkbox" id="mask${i}" value="${i}" onchange="setMask()"> `;
        if (numLanes > 4 && i > ((numLanes / 2) - 0.5) && i <= ((numLanes / 2) + 0.5)) {
            maskOut += "<br/>";
        }
    };
    liLane.innerHTML = maskOut;
    selElem.appendChild(liLane);

    if (laneMask.length == "0") {
        console.log("Initializing laneMask variable")
        for (var i = 0; i < numLanes; i++) {
            laneMask[i] = 0;
        };
    };

}

function clearClass(class_Name) {
    var tempArr = Array.prototype.slice.call(document.getElementsByClassName(class_Name));
    if (tempArr.length !== 0) {
        for (var i = 0; i < tempArr.length; i++) {
            var tempClass = tempArr[i].className
            tempArr[i].className = tempClass.replace(class_Name, "");
        }
    }
}

function clearText(elemID, newTxt) {
    var tempElem = document.getElementById(elemID);
    tempElem.innerHTML = newTxt;
}

function checkKeyValue(arrayObj, key, value) {
    for (var i = 0; i < arrayObj.length; i++) {
        if (arrayObj[i][key] == value) {
            return i;
        }
    }
    return -1;
}

function loadRace() {
    console.log("Try to load race information from file");
}

function saveRace() {
    console.log("Try to save race information to file");
}

function editRace() {
    //not sure if this function is needed
    console.log("Edit the race information");
    var editDialog = document.getElementById("RaceInfoEditModal");
    var closeSpan = document.getElementsByClassName("close")[0];

    editDialog.style.display = "block";

    closeSpan.onclick = () => {
        editDialog.style.display = "none";
    };
}

function newRace() {
    console.log("Prompt for race information");
}

