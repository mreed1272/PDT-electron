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
var raceInformation = {};
var racerStatsFile = "";
var optionsPDT = [];
var rankValuePDT = [];
var rankTextPDT = [];




function onBodyLoad() {
    document.getElementById("RaceSideDialog").style.width = 0;
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
    //var racerFileDiv = document.getElementById("racer-data-file");
    //var racerInputTD = document.getElementById("racerFileInput");
    var currentWindowObj = remote.getCurrentWindow();
    
    dialog.showOpenDialog(currentWindowObj, {
        title: 'Select Race Information file to open:',
        filters: [
            {
                name: 'PDT race files',
                extensions: ['pdt_race']
            }
        ]
    }, (filenames) => {
        if (!filenames) return;
        if (filenames.length > 0) {
            var tmpData = fs.readFileSync(filenames[0]);
            // parse, format input txt and put into page
            raceInformation = JSON.parse(tmpData);

            console.log(raceInformation);

            remote.app.addRecentDocument(filenames[0]);
            //racerFileDiv.innerHTML = filenames[0].split('\\').pop().split('/').pop();
            //racerInputTD.innerHTML = filenames[0].split('\\').pop().split('/').pop();
            //racerStatsFile = filenames[0];
            updateRaceInfo();
        }
    })
}

function saveRace() {
    console.log("Try to save race information to file");
    //var racerFileDiv = document.getElementById("racer-data-file");
    //var racerInputTD = document.getElementById("racerFileInput");

    if (isObjEmpty(raceInformation)){
        return -1;
    };
    var currentWindowObj = remote.getCurrentWindow();

    dialog.showSaveDialog(currentWindowObj, {
        title: 'Save Race . . .',
        filters: [
            {
                name: "PDT race information files",
                extensions: ['pdt_race']
            }
        ]
    }, (filenames) => {
        console.log(`Filename from save dialog: ${filenames}`);
        if (!filenames) return;
        if (filenames.length > 0) {
            var contentJSON = JSON.stringify(raceInformation);
            console.log(raceInformation);
            console.log(contentJSON);
            //save txt
            fs.writeFileSync(filenames, contentJSON);
            //racerFileDiv.innerHTML = filenames.split('\\').pop().split('/').pop();
            //racerInputTD.innerHTML = filenames.split('\\').pop().split('/').pop();
            //racerStatsFile = filenames;
        }
    })
}

function checkRaceDialog(type) {
    var editSideDialog = document.getElementById("RaceSideDialog");
    //console.log(editSideDialog.style.width);
    if (editSideDialog.style.width !== "0px") {
        //console.log(`Setting dialog width to 0.`);
        editSideDialog.style.width = "0px";
        setTimeout(() => {
            //console.log(`Doing a timeout before calling function`);
            editRaceDialog(type)
        }, 700);
    } else {
        editRaceDialog(type);
    }


}

function clickMenuTab(tabNum) {
    var tabMenu = document.getElementById("tabbedItems").getElementsByTagName("ul")[0].getElementsByTagName("li")

    tabMenu[tabNum].click();
}

function editRaceDialog(type) {
    //console.log("Prompt for race information");
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
    var racerInputTD = document.getElementById("racerFileInput");

    var rankCheck = document.getElementById("orgRankInclude").getElementsByTagName("input");

    if (racerStatsFile === "") {
        racerInputTD.innerHTML = `<button type="button" onclick='loadRacers()'>Select Racers File</button> <button type="button" onclick='clickMenuTab(2)'>Enter New Racers</button>`
    } else {
        racerInputTD.innerHTML = racerStatsFile.split('\\').pop().split('/').pop();
    }

    switch (type) {

        case "new":
            if (!isObjEmpty(raceInformation)) {
                return -1;
            }
            headerDialog.innerHTML = "New Race";
            dialogButton.innerHTML = "OK";
            break;

        case "edit":
            if (isObjEmpty(raceInformation)) {
                return -1;
            } else {
                headerDialog.innerHTML = "Edit Race";
                dialogButton.innerHTML = "Update";
                //load the information from the object into the form
                orgNameInput.value = raceInformation["OrgName"];
                orgTypeInput.value = raceInformation["OrgType"];
                raceHeatsInput.value = raceInformation["RaceHeats"];
                raceScoreInput.value = raceInformation["RaceScoring"];
                raceCoordInput.value = raceInformation["RaceCoordinator"];
                raceDateInput.value = raceInformation["RaceDate"];
                racerStatsFile = raceInformation["RacerStatsFile"];
                for (var i = 0; i < raceInformation.RacerRanks.length; i++) {
                    document.getElementById(`rank-${raceInformation.RacerRanks[i]}`).checked = true;
                };

            }
            break;

        case "update":
            var tmpIsChecked = false;
            var tmpRankCheckedIndex = [];

            for (var i = 0; i < rankCheck.length; i++) {
                if (rankCheck[i].checked === true) {
                    tmpIsChecked = true;
                    tmpRankCheckedIndex.push(i);
                };
            };

            if (orgNameInput.value === "" || raceHeatsInput.value === "" || raceCoordInput.value === "" || raceDateInput === "" || tmpIsChecked === false) {
                alert(`Please make sure none of the fields are empty and that at least one rank is checked.`);
                return;
            };

            //load the information into the global variable
            raceInformation["OrgName"] = orgNameInput.value;
            raceInformation["OrgType"] = orgTypeInput.value;
            raceInformation["RaceHeats"] = raceHeatsInput.value;
            raceInformation["RaceScoring"] = raceScoreInput.value;
            raceInformation["RaceCoordinator"] = raceCoordInput.value;
            raceInformation["RaceDate"] = raceDateInput.value;
            raceInformation["RacerStatsFile"] = racerStatsFile;
            raceInformation["RacerRanks"] = tmpRankCheckedIndex;

            //reset the form, keeping the select values
            orgNameInput.value = "";
            orgTypeInput.value = raceInformation.OrgType;
            loadRanks(raceInformation.OrgType);
            raceHeatsInput.value = "";
            raceScoreInput.value = raceInformation.RaceScoring;
            raceCoordInput.value = "";
            raceDateInput.value = "";
            editSideDialog.style.width = "0";

            updateRaceInfo();

            return;

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
            clearRacers();
            clearObject(raceInformation);

            return -1;

        case "close":
            editSideDialog.style.width = "0px";

            return -1;

    }

    editSideDialog.style.width = "700px";


}

function updateRaceInfo() {
    //update the div "RaceInfoDisplay"
    var raceInfoDiv = document.getElementById("RaceInfoDisplay");
    var tmpOutStr = "";
    var tmpRanksNames = [];
    racerStatsFile = raceInformation.RacerStatsFile;
    if (isObjEmpty(racerStats)){
        //if not loaded, load the racer stats file
        var tmpData = fs.readFileSync(racerStatsFile);
        //parse the file and load into global variable
        racerStats = JSON.parse(tmpData);
        document.getElementById("racer-data-file").innerHTML = racerStatsFile.split('\\').pop().split('/').pop();
        //document.getElementById("racerFileInput").innerHTML = racerStatsFile.split('\\').pop().split('/').pop();
        updateRacerStatsList();
    }

    if (!isObjEmpty(raceInformation)) {
        for (var i = 0; i < raceInformation.RacerRanks.length; i++) {
            tmpRanksNames[i] = rankTextPDT[raceInformation.RacerRanks[i]];
        };

        tmpOutStr = `<ul>`;
        tmpOutStr += `<li>Organization Name: <b>${raceInformation.OrgName}</b></li>`;
        tmpOutStr += `<li>Organization Type: <b>${raceInformation.OrgType}</b></li>`;
        tmpOutStr += `<li>Ranks Included in Race: <b>${tmpRanksNames.join()}</b></li>`;
        tmpOutStr += `<li>Number of Heats: <b>${raceInformation.RaceHeats}</b></li>`;
        tmpOutStr += `<li>Race Scoring Method: <b>${(raceInformation.RaceScoring === "timed" ? "Fastest Time" : "Point Elimination")}</b></li>`;
        tmpOutStr += `<li>Race Coordinator: <b>${raceInformation.RaceCoordinator}</b></li>`;
        tmpOutStr += `<li>Date of Race: <b>${raceInformation.RaceDate}</b></li>`;
        tmpOutStr += `<li>Racer Information File: <b>${racerStatsFile.split('\\').pop().split('/').pop()}</b></li>`;
        tmpOutStr += `</ul>`;
    };

    raceInfoDiv.innerHTML = tmpOutStr;
}



function loadOptions() {
    console.log("Loading the options/variable file");
    //load the config json file
    var tmpData = fs.readFileSync(`${__dirname}/config/default-config.json`);
    optionsPDT = JSON.parse(tmpData);
    rankValuePDT = optionsPDT.OrgType[checkKeyValue(optionsPDT.OrgType, "name", "Cub Scout")].rank_value;
    rankTextPDT = optionsPDT.OrgType[checkKeyValue(optionsPDT.OrgType, "name", "Cub Scout")].rank_text;
    //load default options for cub scout organization
    loadSelect("RacerRank", rankValuePDT, "Tiger", rankTextPDT);
    loadSelect("OrgTypeSelect", getKeyValues(optionsPDT.OrgType, "name"), "Cub Scout");

    // create checkboxes for ranks in Race Info dialog
    createCheckList("orgRankInclude", "rank", rankTextPDT, rankValuePDT);

}

function loadRanks(orgTypeTxt) {
    var rankValuePDT = optionsPDT.OrgType[checkKeyValue(optionsPDT.OrgType, "name", orgTypeTxt)].rank_value;
    var rankTextPDT = optionsPDT.OrgType[checkKeyValue(optionsPDT.OrgType, "name", orgTypeTxt)].rank_text;

    if (orgTypeTxt = "Cub Scout") {
        loadSelect("RacerRank", rankValuePDT, "Tiger", rankTextPDT);
    } else {
        loadSelect("RacerRank", rankValuePDT, rankValue[0], rankTextPDT);
    };

    createCheckList("orgRankInclude", "rank", rankTextPDT, rankValuePDT);
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

function isObjEmpty(obj) {
    for (var x in obj) { if (obj.hasOwnProperty(x)) return false; }
    return true;
}

function clearObject(Obj) {
    for (var j in Obj) {
        if (Obj.hasOwnProperty(j)) {
            delete Obj[j];
        };
    }
}