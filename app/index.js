const electron = require('electron');
const remote = electron.remote;
const dialog = electron.remote.dialog;
const shell = electron.shell;
const fs = require('fs');
const ipcRenderer = electron.ipcRenderer;

//const serialport = require('serialport');
var SerialPort = require('serialport');//serialport.SerialPort;

var PDT = null;

var lastSerialCommand = "";
var lastSerialResponse = "";
var laneMask = [];
var laneTimes = [];
var initArduino = false;
var initLane = false;
var numLanes = 2; //default to 1 lanes
var currentTab = "mainT";

var patt = "Arduino";

var comPorts = [];


function onBodyLoad() {
    document.getElementById("mainT").style.display = "block";
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
}

function initSerial() {
    console.log("Initializing serial port");
    SerialPort.list(function (err, ports) {
        var outStr = [];
        if (comPorts.length != 0) {
            comPorts.length = 0;
        }
        //var serPorts = [];
        if (err) { console.log(err); return; };

        comPorts = ports.map(function (port) {
            return port.comName
        });
        //outStr = comPorts.join();
        console.log(comPorts);
        loadSelect("serial-port-list", comPorts, "");

        //document.getElementById('port-names').innerHTML = `${outStr}<br/>`;
        if (ports.length !== 0) {
            setupArduino(ports);
        } else {
            console.log("No serial ports found");
            var footerElem = document.getElementsByClassName("footer-item");

            for (var i = 0; i < footerElem.length; i++) {
                footerElem[i].style.visibility = "hidden";
            }
            document.getElementById("serial-timer").innerHTML = "No Timer Connected";
            document.getElementById("serial-timer").style.visibility = "visible";
            if (!initLane) {
                initLanes(numLanes, "tlane");
                initLane = true;
            }
            //populate lane listing under test track select id "test-lane-watch"
            var tmpArr = [];
            for (var i = 0; i < numLanes; i++) {
                tmpArr[i] = i + 1;
            }
            loadSelect("test-lane-watch", tmpArr, 1);

        };
    });
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
        maskOut += ` Lane ${i} <input type="checkbox"> `;
        if (numLanes > 4 && i > ((numLanes / 2) - 0.5) && i <= ((numLanes / 2) + 0.5)) {
            maskOut += "<br/>";
        }
    };
    liLane.innerHTML = maskOut;
    selElem.appendChild(liLane);

}

function setupArduino(availPorts) {

    for (var i = 0; i < availPorts.length; i++) {
        var testStr = availPorts[i].manufacturer.toString();
        if (testStr.search(patt) >= 0) {
            document.getElementById("serial-timer").innerHTML = availPorts[i].comName;
            PDT = new SerialPort(availPorts[i].comName, { baudrate: 9600, parser: SerialPort.parsers.readline('\n') });
            initArduino = true;
        } else {
            console.log("No timer found")
            var footerElem = document.getElementsByClassName("footer-item");

            for (var i = 0; i < footerElem.length; i++) {
                footerElem[i].style.visibility = "hidden";
            }
            document.getElementById("serial-timer").innerHTML = "No Timer Connected";
            document.getElementById("serial-timer").style.visibility = "visible";
            if (!initLane) {
                initLanes(numLanes, "tlane");
                initLane = true;
                //populate lane listing under test track select id "test-lane-watch"
                var tmpArr = [];
                for (var i = 0; i < numLanes; i++) {
                    tmpArr[i] = i + 1;
                }
                loadSelect("test-lane-watch", tmpArr, 1);
            }
            return false;
        };
    };

    PDT.on('data', function (data) {
        var outStr = `${data}<br/>`;
        //console.log(`Serial data: ${data} \t Previous data: ${lastSerialResponse}`);
        if (data.trim() == "K" && lastSerialResponse == "P") {
            writeToArduino("V");
            writeToArduino("N");
            writeToArduino("G");
            //initArduino = true;
        }
        var serialDiv = document.getElementById('serial-output');
        serialDiv.innerHTML += outStr;
        serialDiv.scrollTop = serialDiv.scrollHeight;
        checkSerialData(data.trim());
        lastSerialResponse = data.trim();
    });
}

function writeToArduino(str) {
    if (initArduino) {
        if (PDT.isOpen) {
            setTimeout(() => {
                PDT.write(str, (err) => {
                    if (err != null) {
                        console.log(err);
                    };
                })
            }, 100);
        };
        lastSerialCommand = str;
    } else {
        console.log("No Arduino Timer connected.")
    };
}

function sendSerialForm() {
    var serialStr = document.getElementById("serial-command").value;
    writeToArduino(serialStr);
    document.getElementById("serial-command").value = "";
}

function checkSerialData(data) {
    //console.log(data.charAt(0));
    switch (data.charAt(0)) {
        case "K":
            console.log("Timer ready");
            document.getElementById("status-timer").innerHTML = "Ready";
            document.getElementById("status-timer").className = "footer-item ready";
            break;

        case "B":
            console.log("Racing...");
            document.getElementById("status-timer").innerHTML = "Racing...";
            document.getElementById("status-timer").className = "footer-item racing";
            clearDisplay();
            break;

        case "P":
            console.log("Arduino power-up");
            document.getElementById("status-timer").innerHTML = "Powering up...";
            break;

        case ".":
            if (lastSerialCommand == "G") {
                console.log("Gate closed");
                document.getElementById("gate-timer").innerHTML = "Gate Closed";
                document.getElementById("gate-timer").className = "footer-item closed";
            };
            if (/M(\d)/.test(lastSerialCommand)) {
                var maskedLane = RegExp.$1;
                laneMask[maskedLane - 1] = 1;
                updateLaneDisplay();
                console.log(`Masked Lanes done: ${laneMask}`);
            };
            if (lastSerialCommand == "U") {
                if (laneMask.length != 0) {
                    for (var i = 0; i < laneMask.length; i++) {
                        laneMask[i] = 0;
                    };
                };
                updateLaneDisplay();
                console.log(`All lanes unmasked: ${laneMask}`);
            };
            break;

        case "O":
            console.log("Gate open.");
            document.getElementById("status-timer").innerHTML = "Not Ready";
            document.getElementById("status-timer").className = "footer-item not_ready";
            document.getElementById("gate-timer").innerHTML = "Gate Open";
            document.getElementById("gate-timer").className = "footer-item open";
            break;

        case "v":
            console.log("Update timer version");
            if (/vert=(.*)/.test(data)) {
                document.getElementById("timer-version").innerHTML = `PDT V${RegExp.$1}`;
            };
            break;

        case "n":
            console.log("Update number of lanes");
            if (/numl=(\d)/.test(data)) {
                numLanes = RegExp.$1;
                document.getElementById("lanes-timer").innerHTML = `${numLanes} Lanes`;
                if (!initLane) {
                    initLanes(numLanes, "tlane");
                    initLane = true;
                    //populate lane listing under test track select id "test-lane-watch"
                    var tmpArr = [];
                    for (var i = 0; i < numLanes; i++) {
                        tmpArr[i] = i + 1;
                    }
                    loadSelect("test-lane-watch", tmpArr, 1);
                };
            };
            //setup lane mask variable for # of lanes but only if not done already
            //console.log(`laneMask is ${laneMask} and length is ${laneMask.length}`);
            if (laneMask.length == "0") {
                console.log("Initializing laneMask variable")
                for (var i = 0; i < numLanes; i++) {
                    laneMask[i] = 0;
                };
            };

            break;

        default:
            var testRegEx = /(\d) - (\d+\.\d*)/.test(data);
            if (testRegEx) {
                var tempLaneNum = RegExp.$1;
                var tempLaneTime = RegExp.$2;
                //console.log(`current tab-${currentTab}`);
                if (currentTab == "testTrackT") {
                    var tempLaneId = `tlane-lane${tempLaneNum}`;
                } else {
                    var tempLaneId = `lane${tempLaneNum}`;
                }
                if (laneMask[tempLaneNum - 1] != 1) {
                    //console.log(`Update lane ${tempLaneNum} with time ${tempLaneTime}`);
                    document.getElementById(tempLaneId).innerHTML = tempLaneTime;
                    laneTimes.push({ lane: tempLaneNum, time: tempLaneTime });
                };
                if (tempLaneNum == numLanes) {
                    //console.log(laneTimes);
                    laneTimes.sort(function (a, b) {
                        return a.time - b.time;
                    });
                    if (currentTab == "testTrackT") {
                        var winnerLane = [`tlane-lane${laneTimes[0].lane}-Li`, `tlane-lane${laneTimes[1].lane}-Li`, `tlane-lane${laneTimes[2].lane}-Li`];
                    } else {
                        var winnerLane = [`lane${laneTimes[0].lane}-Li`, `lane${laneTimes[1].lane}Li`, `lane${laneTimes[2].lane}Li`];
                    }

                    document.getElementById(winnerLane[0]).className = "winner1";
                    document.getElementById(winnerLane[1]).className = "winner2";
                    document.getElementById(winnerLane[2]).className = "winner3";

                }
            };
            break;
    }
}

function resetArduino() {
    document.getElementById("reset-pdt").className = "clicked";
    writeToArduino("R");
    setTimeout(() => {
        document.getElementById("reset-pdt").className = "";
        clearDisplay();
    }, 100);
}

function updateLaneDisplay() {
    for (var i = 0; i < laneMask.length; i++) {
        var tempLaneId = "lane" + (i + 1) + "Li";
        //        console.log(`temp lane Id: ${tempLaneId}`);
        switch (laneMask[i]) {
            case 1:
                document.getElementById(tempLaneId).style = "visibility: hidden;";
                //                console.log(`Hiding lane ${i}.`);
                break;
            case 0:
                document.getElementById(tempLaneId).style = "visibility: visible;";
                break;
        };
    }
}
function clearClass(class_Name) {
    var tempArr = Array.prototype.slice.call(document.getElementsByClassName(class_Name));
    if (tempArr.length !== 0) {
        for (var i = 0; i < tempArr.length; i++) {
            var tempClass = tempArr[i].className
            tempArr[i].className = tempClass.replace(class_Name,"");
        }
    }
}
function clearDisplay() {
    var tempDisplay = document.getElementsByClassName("LEDdisplay");
    var tempWinner1 = Array.prototype.slice.call(document.getElementsByClassName("winner1"));

    clearClass("winner1");
    clearClass("winner2");
    clearClass("winner3");

    laneTimes.length = 0;
}

function clearText(elemID, newTxt) {
    var tempElem = document.getElementById(elemID);
    tempElem.innerHTML = newTxt;
}

function clearHistory() {
    var outStr = "<tr><th>Run #</th><th>Time (s)</th><th>Delta (s)</th></tr>";
    clearText("lane-history-table", outStr);
}

function saveHistory() {
    dialog.showSaveDialog({
        title: 'Save History file. . .',
        filters: [
            {
                name: "PDT history files",
                extensions: ['pdth', 'pdt_history']
            }
        ]
    }, (filenames) => {
        console.log(`Filenames from save dialog: ${filenames}`);
        if (!filenames) return;
        if (filenames.length > 0) {
            //generate txt
            var contents = {};
            contents["lane"] = document.getElementById("test-lane-watch").value;
            contents["notes"] = document.getElementById("test-notes").value;
            contents["session_date"] = document.getElementById("test-date").innerHTML;
            contents["session_table"] = document.getElementById("lane-history-table").innerHTML;
            var contentJSON = JSON.stringify(contents);
            //save txt
            fs.writeFileSync(filenames, contentJSON);
        }
    })
}

function loadHistory() {
    dialog.showOpenDialog({
        title: 'Select history file to open:',
        filters: [
            {
                name: 'PDT history files',
                extensions: ['pdth', 'pdt_history']
            }
        ]
    }, (filenames) => {
        if (!filenames) return;
        if (filenames.length > 0) {
            var tmpData = fs.readFileSync(filenames[0]);
            // parse, format input txt and put into page

            remote.app.addRecentDocument(filenames[0]);
        }
    })
}