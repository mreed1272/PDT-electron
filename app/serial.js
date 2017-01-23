var SerialPort = require('serialport');

var PDT = null;
var patt = "Arduino";
var comPorts = [];

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
            document.getElementById("serial-timer").innerHTML = "No Serial Ports";
            document.getElementById("serial-timer").style.visibility = "visible";
            if (!initLane) {
                initLanes(numLanes, "tlane");
                initLanes(numLanes, "race-lane");
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
                initLanes(numLanes, "race-lane")
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
    console.log(`Command string: ${str}`);
    if (initArduino) {
        if (PDT.isOpen) {
            setTimeout(() => {
                PDT.write(str, (err) => {
                    if (err != null) {
                        console.log(err);
                    };
                })
            }, 200);
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
                //updateLaneDisplay();
                console.log(`Masked Lanes done: ${laneMask}`);
            };
            if (lastSerialCommand == "U") {
                if (laneMask.length != 0) {
                    for (var i = 0; i < laneMask.length; i++) {
                        laneMask[i] = 0;
                    };
                };
                //updateLaneDisplay();
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
                } else {
                    laneTimes.push({ lane: tempLaneNum, time: 99 });
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

                    updateHistoryTable(laneTimes);
                }
            };
            break;
    }
}

function resetArduino() {
    writeToArduino("R");
    clearDisplay();
    setMask();
}
