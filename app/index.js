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
var racerStatsFile = "";
var optionsPDT = [];




function onBodyLoad() {
    document.getElementById("mainT").style.display = "block";
    document.getElementById("RacerInfo").style.display = "none";

    loadOptions();
    initSerial();
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
    if (selElem.options.length > 0) {
        removeSelectOptions(selElem);
    };

    for (var i = 0; i < optValueArr.length; i++) {
        var option = document.createElement("option");
        if (optTextArr !== undefined) {
            option.text = optTextArr[i];
        } else {
            option.text = optValueArr[i];
        };
        option.value = optValueArr[i];
        selElem.add(option, i);
        if (optValueArr[i] == selectItem) {
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

function editRaceDialog(type) {
    console.log("Prompt for race information");
    var editSideDialog = document.getElementById("RaceSideDialog");
    var headerDialog = editSideDialog.getElementsByTagName("h2")[0];
    var closeSpan = document.getElementsByClassName("close")[0];
    var dialogButton = document.getElementById("editRaceButton");

    var orgNameInput = document.getElementById("orgName");
    var orgTypeInput = document.getElementById("OrgTypeSelect");
    var rankCheckBox = document.getElementById("orgRankInclude").getElementsByTagName("input");
    var raceHeatsInput = document.getElementById("raceHeats");
    var raceScoreInput = document.getElementById("raceScoreMethod");
    var raceCoordInput = document.getElementById("raceCoord");
    var raceDateInput = document.getElementById("raceDate");

    //console.log(orgTypeInput);

    switch (type) {

        case "new":
            headerDialog.innerHTML = "New Race";
            dialogButton.innerHTML = "OK";
            break;

        case "edit":
            headerDialog.innerHTML = "Edit Race";
            dialogButton.innerHTML = "Update";
            break;

        case "update":

            break;

        case "cancel":
            //empty the form and set back to defaults
            orgNameInput.value = "";
            orgTypeInput.value = "Cub Scout";
            loadRanks("Cub Scout");
            raceHeatsInput.value = "";
            raceScoreInput.value = "timed";
            raceCoordInput.value = "";
            raceDateInput.value = "";
            editSideDialog.style.width = "0";
            return -1;

    }

    editSideDialog.style.width = "700px";

    /*closeSpan.onclick = () => {
        editSideDialog.style.width = "0";
        return false;
    };*/
}



function loadOptions() {
    console.log("Loading the options/variable file");
    //load the config json file
    var tmpData = fs.readFileSync(`${__dirname}/config/default-config.json`);
    optionsPDT = JSON.parse(tmpData);
    var tmpRankValue = optionsPDT.OrgType[checkKeyValue(optionsPDT.OrgType, "name", "Cub Scout")].rank_value;
    var tmpRankTxt = optionsPDT.OrgType[checkKeyValue(optionsPDT.OrgType, "name", "Cub Scout")].rank_text;
    //load default options for cub scout organization
    loadSelect("RacerRank", tmpRankValue, "Tiger", tmpRankTxt);
    loadSelect("OrgTypeSelect", getKeyValues(optionsPDT.OrgType, "name"), "Cub Scout");

    // create checkboxes for ranks in Race Info dialog
    createCheckList("orgRankInclude", "rank", tmpRankTxt, tmpRankValue);

}

function loadRanks(orgTypeTxt) {
    var rankValues = optionsPDT.OrgType[checkKeyValue(optionsPDT.OrgType, "name", orgTypeTxt)].rank_value;
    var rankText = optionsPDT.OrgType[checkKeyValue(optionsPDT.OrgType, "name", orgTypeTxt)].rank_text;

    if (orgTypeTxt = "Cub Scout") {
        loadSelect("RacerRank", rankValues, "Tiger", rankText);
    } else {
        loadSelect("RacerRank", rankValues, rankValue[0], rankText);
    };

    createCheckList("orgRankInclude", "rank", rankText, rankValues);
}

function createCheckList(divID, checkID, labelArr, checkValueArr) {
    var checkOutTxt = "";
    var divElement = document.getElementById(divID);

    for (var i = 0; i < labelArr.length; i++) {
        checkOutTxt += `<label for="${checkID}-${i}">${labelArr[i]}</label>`;
        checkOutTxt += `<input type="checkbox" id="${checkID}-${i}" value="${checkValueArr[i]}">`;
    }

    divElement.innerHTML = checkOutTxt;
}

function removeSelectOptions(obj) {
    while (obj.options.length) {
        obj.remove(0);
    }
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
