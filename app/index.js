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
var numLanes = 1; //default to 3 lanes
var currentTab = "mainT";

var patt = "Arduino";


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
        var serPorts = [];
        if (err) { console.log(err); return; };

        serPorts = ports.map(function (port) {
            return port.comName
        });
        outStr = serPorts.join();
        //console.log(serPorts);
        loadSelect("serial-port-list", serPorts, "");

        document.getElementById('port-names').innerHTML = `${outStr}<br/>`;
        if (ports.length !== 0) {
            setupArduino(ports);
        } else {
            console.log("No serial ports found");
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
    //console.log(selElem);
    for (var i = 1; i <= numLanes; i++) {
        liID = `${ulId}-lane${i}-Li`;
        //console.log(liID);
        var spanID = `${ulId}-lane${i}`;
        //console.log(spanID);
        liLane = document.createElement("li");

        liLane.id = liID;
        if (!initArduino) {
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
        if (numLanes > 4 && i > ((numLanes/2)-0.5) && i <= ((numLanes/2)+0.5)) {
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
            //initArduino = true;
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
            initArduino = true;
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
                    initLanes(numLanes, "test-lanes");
                    initLane = true;
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

function clearDisplay() {
    var tempDisplay = document.getElementsByClassName("LEDdisplay");
    var tempWinner1 = document.getElementsByClassName("winner1");
    if (tempWinner1[0] != null) {
        tempWinner1[0].className = "";
    }
    var tempWinner2 = document.getElementsByClassName("winner2");
    if (tempWinner2[0] != null) {
        tempWinner2[0].className = "";
    }
    var tempWinner3 = document.getElementsByClassName("winner3");
    if (tempWinner3[0] != null) {
        tempWinner3[0].className = "";
    }
    for (var i = 0; i < tempDisplay.length; i++) {
        tempDisplay[i].innerHTML = "0.0000";
    };
    laneTimes.length = 0;
}