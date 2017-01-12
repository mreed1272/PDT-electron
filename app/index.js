const electron = require('electron');
const remote = electron.remote;
const dialog = electron.remote.dialog;
const shell = electron.shell;
const fs = require('fs');
const ipcRenderer = electron.ipcRenderer;


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
var optionsPDT = [];




/*window.onclick = (event) => {
    if (event.target == document.getElementById("RaceInfoEditModal")) {
        document.getElementById("RaceInfoEditModal").style.display = "none";
    }
}*/

function onBodyLoad() {
    document.getElementById("mainT").style.display = "block";
    document.getElementById("RacerInfo").style.display = "none";

    loadOptions();
    initSerial();

    /*window.onclick = (event) => {
        if (event.target == document.getElementById("RaceInfoEditModal")) {
            document.getElementById("RaceInfoEditModal").style.display = "none";
        }
    }*/

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


function loadSelect(selectID, optValueArr, selectItem, optTextArr) {
    var selElem = document.getElementById(selectID);
    //var option = document.createElement("option");
    //console.log(`Value of optTextArr is ${optTextArr}`);
    for (var i = 0; i < optValueArr.length; i++) {
        var option = document.createElement("option");
        if (optTextArr !== undefined) {
            option.text = optTextArr[i];
        } else {
            option.text = optValueArr[i];
        };
        option.value = optValueArr[i];
        selElem.add(option, i);
        if (optValueArr[i].value == selectItem) {
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

function loadRace() {
    console.log("Try to load race information from file");
}

function saveRace() {
    console.log("Try to save race information to file");
}

function editRace() {
    //not sure if this function is needed
    console.log("Edit the race information");
    var editSideDialog = document.getElementById("RaceSideDialog");

    var closeSpan = document.getElementsByClassName("close")[0];
    
    
    //editDialog.style.display = "block";
    editSideDialog.style.width = "700px";

    closeSpan.onclick = () => {
        editSideDialog.style.width = "0";
        return false;
    };
}

function newRace() {
    console.log("Prompt for race information");
    var editSideDialog = document.getElementById("RaceSideDialog");
    var headerDialog = editSideDialog.getElementsByTagName("h2")[0];

    var closeSpan = document.getElementsByClassName("close")[0];
    
    headerDialog.innerHTML = "New Race";
    
    //editDialog.style.display = "block";
    editSideDialog.style.width = "700px";

    closeSpan.onclick = () => {
        editSideDialog.style.width = "0";
        return false;
    };
}

function loadOptions() {
    console.log("Loading the options/variable file");
    //load the config json file
    var tmpData = fs.readFileSync(`${__dirname}/config/default-config.json`);
    optionsPDT = JSON.parse(tmpData);
    //console.log(optionsPDT);

    //load default options for cub scout organization
    loadSelect("RacerRank", optionsPDT.OrgType[checkKeyValue(optionsPDT.OrgType, "name", "Cub Scout")].rank_value, "Tiger", optionsPDT.OrgType[checkKeyValue(optionsPDT.OrgType, "name", "Cub Scout")].rank_text);
    loadSelect("OrgTypeSelect",getKeyValues(optionsPDT.OrgType, "name"),"Cub Scout");

    // create checkboxes for ranks in Race Info dialog
    var raceDialogRanks = document.getElementById("orgRankInclude");
    var rankOut = "";
    for (var i = 0; i < optionsPDT.OrgType[checkKeyValue(optionsPDT.OrgType, "name", "Cub Scout")].rank_text.length; i ++){
    rankOut += `<label for="rank-${i}">${optionsPDT.OrgType[checkKeyValue(optionsPDT.OrgType, "name", "Cub Scout")].rank_text[i]}</label>`;
    rankOut += `<input type="checkbox" id="rank-${i}" value="${optionsPDT.OrgType[checkKeyValue(optionsPDT.OrgType, "name", "Cub Scout")].rank_value[i]}">`;
    }
    raceDialogRanks.innerHTML = rankOut;
}

function getKeyValues(objArr, key) {
    var tmpArr = [];
    if (Array.isArray(objArr)) {
        for (var i = 0; i < objArr.length; i++) {
            tmpArr.push(objArr[i][key]);
        }
        return tmpArr;
    }
    return -1;
}

function checkKeyValue(arrayObj, key, value) {
    if (Array.isArray(arrayObj)) {
        for (var i = 0; i < arrayObj.length; i++) {
            if (arrayObj[i][key] == value) {
                return i;
            }
        }
    }
    return -1;
}
