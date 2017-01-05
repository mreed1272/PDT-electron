
function addRacer() {
    //first get the values
    var tmpCarNum = document.getElementById("CarNum");
    var tmpRacerName = document.getElementById("RacerName");
    var tmpCarWeight = document.getElementById("CarWeight");
    var tmpRacerRank = document.getElementById("RacerRank");

    //check to see if already in Array

    if (racerStats.length != 0) {
        for (var i = 0; i < racerStats.length; i++) {
            if (racerStats[i].car === tmpCarNum.value) {
                racerStats[i].racer_name = tmpRacerName.value;
                racerStats[i].weight = tmpCarWeight.value;
                racerStats[i].rank = tmpRacerRank.value;
                racerStats[i].total_time = 0;
                //update racer display
                //console.log(racerStats);
                updateRacerStatsList();
                tmpCarNum.value = "";
                tmpRacerName.value = "";
                tmpCarWeight.value = "";
                tmpRacerRank.value = "Tiger";

                return;
            }
        };
        racerStats.push({ car: tmpCarNum.value, racer_name: tmpRacerName.value, weight: tmpCarWeight.value, rank: tmpRacerRank.value, total_time: 0 });
        tmpCarNum.value = "";
        tmpRacerName.value = "";
        tmpCarWeight.value = "";
        tmpRacerRank.value = "Tiger";
    } else {
        racerStats.push({ car: tmpCarNum.value, racer_name: tmpRacerName.value, weight: tmpCarWeight.value, rank: tmpRacerRank.value, total_time: 0 });
        tmpCarNum.value = "";
        tmpRacerName.value = "";
        tmpCarWeight.value = "";
        tmpRacerRank.value = "Tiger";
    }
    //update display
    //console.log(racerStats);
    updateRacerStatsList();
}

function updateRacerStatsList() {
    var mainRacerListDiv = document.getElementById("RacerInfo")
    var racerListDiv = document.getElementById("RacerStatsList");
    var tempOutStr = "";
    var tempOutTable = "<table id='mainRacerList'><tr><th>Car Number</th><th>Racer Name</th><th>Car Weight (oz)</th><th>Rank</th><th>Total Time (s)</th></tr>";

    if (racerStats.length != 0) {
        racerStats.sort(function (a, b) {
            return a.car - b.car;
        })

        for (var i = 0; i < racerStats.length; i++) {
            tempOutStr += `<ul>`;
            tempOutStr += `<span onclick="editRacer(this.parentNode, 'delete')" class="faicon">&#xf014</span>`;
            tempOutStr += `<span onclick="editRacer(this.parentNode, 'edit')" class="faicon">&#xf040</span>`;
            tempOutStr += `<li>Car Number: ${racerStats[i].car}</li>`;
            tempOutStr += `<li>Racer Name: ${racerStats[i].racer_name}</li>`;
            tempOutStr += `<li>Car Weight: ${racerStats[i].weight}</li>`;
            tempOutStr += `<li>Racer Rank: ${racerStats[i].rank}</li>`;
            tempOutStr += `</ul>`;

            tempOutTable += `<tr><td>${racerStats[i].car}</td>`;
            tempOutTable += `<td>${racerStats[i].racer_name}</td>`;
            tempOutTable += `<td>${racerStats[i].weight}</td>`;
            tempOutTable += `<td>${racerStats[i].rank}</td>`;
            if (racerStats[i].total_time === undefined) {
                racerStats[i].total_time = 0;
            };
            tempOutTable += `<td>${racerStats[i].total_time}</td></tr>`;
        }
    } else {
        tempOutStr = "No Racers.";
    }
    tempOutTable += "</table>";

    racerListDiv.innerHTML = tempOutStr;
    mainRacerListDiv.innerHTML = tempOutTable;
}
function saveRacers() {
    var racerFileDiv = document.getElementById("racer-data-file");

    dialog.showSaveDialog({
        title: 'Save Racer Stats file. . .',
        filters: [
            {
                name: "PDT racer files",
                extensions: ['pdtr', 'pdt_racer']
            }
        ]
    }, (filenames) => {
        console.log(`Filename from save dialog: ${filenames}`);
        if (!filenames) return;
        if (filenames.length > 0) {
            var contentJSON = JSON.stringify(racerStats);
            //save txt
            fs.writeFileSync(filenames, contentJSON);
            racerFileDiv.innerHTML = filenames.split('\\').pop().split('/').pop();
            racerStatsFile = filenames;
        }
    })
}

function loadRacers() {
    var racerFileDiv = document.getElementById("racer-data-file");

    dialog.showOpenDialog({
        title: 'Select Racer Stats file to open:',
        filters: [
            {
                name: 'PDT racer files',
                extensions: ['pdtr', 'pdt_racer']
            }
        ]
    }, (filenames) => {
        if (!filenames) return;
        if (filenames.length > 0) {
            var tmpData = fs.readFileSync(filenames[0]);
            // parse, format input txt and put into page
            racerStats = JSON.parse(tmpData);
            //racerStats.push(dataObj);
            remote.app.addRecentDocument(filenames[0]);
            racerFileDiv.innerHTML = filenames[0].split('\\').pop().split('/').pop();
            racerStatsFile = filenames[0];
            updateRacerStatsList();
        }
    })
}

function editRacer(objCollection, type) {
    var liList = objCollection.getElementsByTagName("LI");
    console.log(liList);
    console.log(`Function type is ${type}`);
    var carNumEdit = document.getElementById("CarNum");
    var racerNameEdit = document.getElementById("RacerName");
    var carWeightEdit = document.getElementById("CarWeight");
    var racerRankEdit = document.getElementById("RacerRank");

    var testRegEx = /Car Number: (\d*\.?\d*)/.test(liList[0].innerHTML);
    console.log(`Test RegEx - ${testRegEx}`);

    if (testRegEx) {
        var tempCarNum = RegExp.$1;
        for (var i = 0; i < racerStats.length; i++) {
            if (racerStats[i].car === tempCarNum) {
                console.log(`Checking for entry ${i} in array ${(racerStats[i].car === tempCarNum)}`);
                if (type == "edit") {
                    carNumEdit.value = racerStats[i].car;
                    racerNameEdit.value = racerStats[i].racer_name;
                    carWeightEdit.value = racerStats[i].weight;
                    racerRankEdit.value = racerStats[i].rank;
                    racerStats.splice(i, 1);

                }

                if (type == "delete") {
                    racerStats.splice(i, 1);
                    //updateRacerStatsList();
                }
                break;
            }

        }
    }
    updateRacerStatsList();
}