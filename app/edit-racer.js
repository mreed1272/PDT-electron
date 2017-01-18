
function addRacer(type, oldCarNum) {
    //first get the values
    var modButton = document.getElementById("buttonAddRacer");
    var tmpCarNum = document.getElementById("CarNum");
    var tmpRacerName = document.getElementById("RacerName");
    var tmpCarWeight = document.getElementById("CarWeight");
    var tmpRacerRank = document.getElementById("RacerRank");
    var index = -1;
    var oldIndex = -1;

    //console.log(`Old car number is ${oldCarNum}`);

    if (oldCarNum != undefined) {
        oldIndex = checkKeyValue(racerStats, "car", oldCarNum);
    }
    //let's check to see if car number already in use and save the index for later
    /*for (var i = 0; i < racerStats.length; i++) {
        if (racerStats[i].car === tmpCarNum.value) {
            index = i;
            break;
        }
    }*/
    index = checkKeyValue(racerStats, "car", tmpCarNum.value);
    //console.log(`Index is ${index} and old index is ${oldIndex}`);

    //make sure none of the fields are empty
    if ((tmpCarNum.value == "" || tmpRacerName.value == "" || tmpCarWeight.value == "") && (type == "add" || type == "update")) {
        alert(`Please make sure none of the fields are empty.`);
        return;
    }

    switch (type) {
        case "cancel":
            tmpCarNum.value = "";
            tmpRacerName.value = "";
            tmpCarWeight.value = "";
            tmpRacerRank.value = "Tiger";

            if (modButton.innerHTML == "Update Racer") {
                //now change to read Update Racer
                modButton.innerHTML = "Add Racer"
                //now change onclick to update
                modButton.setAttribute('onclick', `addRacer("add")`);
            }

            break;

        case "add":
            if (index >= 0) {
                alert(`This car number (${tmpCarNum.value}) is already being used.  Please enter a new number.`);
                tmpCarNum.focus();
                return;
            }
            racerStats.push({ car: tmpCarNum.value, racer_name: tmpRacerName.value, weight: tmpCarWeight.value, rank: tmpRacerRank.value, total_time: 0 });
            tmpCarNum.value = "";
            tmpRacerName.value = "";
            tmpCarWeight.value = "";
            tmpRacerRank.value = "Tiger";

            break;

        case "update":
            if (oldCarNum != tmpCarNum.value) {
                if (index === -1) {
                    racerStats.splice(oldIndex, 1);
                    racerStats.push({ car: tmpCarNum.value, racer_name: tmpRacerName.value, weight: tmpCarWeight.value, rank: tmpRacerRank.value, total_time: 0 });
                } else {
                    alert(`This car number (${tmpCarNum.value}) is already being used.  Please enter a new number.`);
                    tmpCarNum.focus();
                    return;
                }
            } else {
                racerStats[index].car = tmpCarNum.value;
                racerStats[index].racer_name = tmpRacerName.value;
                racerStats[index].weight = tmpCarWeight.value;
                racerStats[index].rank = tmpRacerRank.value;
            }
            tmpCarNum.value = "";
            tmpRacerName.value = "";
            tmpCarWeight.value = "";
            tmpRacerRank.value = "Tiger";

            if (modButton.innerHTML == "Update Racer") {
                //now change to read Update Racer
                modButton.innerHTML = "Add Racer"
                //now change onclick to update
                modButton.setAttribute('onclick', `addRacer("add")`);
            }

            break;
    }

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
            tempOutStr += `<span onclick="editRacer(this.parentNode, 'edit')" class="faicon">&#xf040</span>`;
            tempOutStr += `<span onclick="editRacer(this.parentNode, 'delete')" class="faicon">&#xf014</span>`;
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

    if (racerStats.length == 0){
        document.getElementById("RacerInfo").style.display = "none";
    } else if (racerStats.length != 0) {
        document.getElementById("RacerInfo").style.display = "block";
    }
}

function saveRacers() {
    var racerFileDiv = document.getElementById("racer-data-file");
    var racerInputTD = document.getElementById("racerFileInput");
    var currentWindowObj = remote.getCurrentWindow();

    dialog.showSaveDialog(currentWindowObj, {
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
            racerInputTD.innerHTML = filenames.split('\\').pop().split('/').pop();
            racerStatsFile = filenames;
        }
    })
}

function loadRacers() {
    var racerFileDiv = document.getElementById("racer-data-file");
    var racerInputTD = document.getElementById("racerFileInput");
    var currentWindowObj = remote.getCurrentWindow();
    
    dialog.showOpenDialog(currentWindowObj, {
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
            racerInputTD.innerHTML = filenames[0].split('\\').pop().split('/').pop();
            racerStatsFile = filenames[0];
            updateRacerStatsList();
        }
    })
}

function clearRacers(){
    var racerFileDiv = document.getElementById("racer-data-file");
    var racerInputTD = document.getElementById("racerFileInput");

    racerStats.length = 0;
    racerFileDiv.innerHTML = "none";
    racerInputTD.innerHTML = "";
    racerStatsFile = "";
    updateRacerStatsList();
}

function editRacer(objCollection, type) {
    //var editDialog = document.getElementById("RacerStatsMod");
    var modButton = document.getElementById("buttonAddRacer");
    var liList = objCollection.getElementsByTagName("LI");
    var carNumEdit = document.getElementById("CarNum");
    var racerNameEdit = document.getElementById("RacerName");
    var carWeightEdit = document.getElementById("CarWeight");
    var racerRankEdit = document.getElementById("RacerRank");
    var tempCarNum = 0;
    var index = -1;

    //find out which entry was clicked on
    for (var i = 0; i < liList.length; i++) {
        var testRegEx = /Car Number: (\d*\.?\d*)/.test(liList[i].innerHTML);
        // console.log(`Test RegEx - ${testRegEx}`);
        if (testRegEx) {
            tempCarNum = RegExp.$1;
            break;
        }
    }

    //find the index position of the entry in the array
    index = checkKeyValue(racerStats, "car", tempCarNum)
    /*for (var i = 0; i < racerStats.length; i++) {
        if (racerStats[i].car === tempCarNum) {
            index = i;
            break;
        }
    }*/

    //now let's deal with the delete or edit
    switch (type) {
        case "edit":
            //check to see if the button is Add or Update - change if needed
            if (modButton.innerHTML == "Add Racer") {
                //now change to read Update Racer
                modButton.innerHTML = "Update Racer"
                //now change onclick to update
                modButton.setAttribute('onclick', `addRacer("update",${RegExp.$1})`);
            }
            carNumEdit.value = racerStats[index].car;
            racerNameEdit.value = racerStats[index].racer_name;
            carWeightEdit.value = racerStats[index].weight;
            racerRankEdit.value = racerStats[index].rank;

            break;

        case "delete":
            racerStats.splice(index, 1);
            //updateRacerStatsList();
            carNumEdit.value = "";
            racerNameEdit.value = "";
            carWeightEdit.value = "";
            racerRankEdit.value = "Tiger";
            if (modButton.innerHTML == "Update Racer") {
                //now change to read Update Racer
                modButton.innerHTML = "Add Racer"
                //now change onclick to update
                modButton.setAttribute('onclick', `addRacer("add")`);
            }

            break;
    }

    //update the display of racers
    updateRacerStatsList();
}