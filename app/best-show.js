const defaultImg = `${__dirname}/images/PDT-main-256.png`;
const tigerImg = `${__dirname}/images/tiger-trans.png`;
const wolfImg = `${__dirname}/images/wolf-trans.png`;
const bearImg = `${__dirname}/images/bear-trans.png`;
const webelosImg = `${__dirname}/images/webelos-trans.png`;
const aolImg = `${__dirname}/images/aol-trans.png`;

function selectWinners() {
    const showID = document.getElementById("bestShow-select");
    const selectID1 = document.getElementById("bestShow-select-1");
    const selectID2 = document.getElementById("bestShow-select-2");
    const selectID3 = document.getElementById("bestShow-select-3");

    if (racerStats.length != 0 && raceRacers.length != 0) {

        if (showSelectValue.length <= 0) {
            showSelectTxt.push(" ");
            showSelectValue.push(0);

            for (var i = 0; i < raceRacers.length; i++) {
                showSelectTxt.push(`${raceRacers[i].car} - ${raceRacers[i].racer_name}`);
                showSelectValue.push(raceRacers[i].car)
            }
        }
        if (selectID1.options.length <= 0 && selectID2.options.length <= 0 && selectID3.options.length <= 0) {
            loadSelect("bestShow-select-1", showSelectValue, "", showSelectTxt);
            loadSelect("bestShow-select-2", showSelectValue, "", showSelectTxt);
            loadSelect("bestShow-select-3", showSelectValue, "", showSelectTxt);
            //console.log(selectID1);
        }
    } else {
        dialog.showErrorBox("No Racers Loaded or Selected", "Please enter and select some racers for the race.");
        return -1;
    }

    if (isObjEmpty(raceInformation)) {
        dialog.showErrorBox("No Race Information", "Please either load a race file or start a new race.");
        return -1;
    }

    //check to see if # of racers has changed
    if ((showSelectValue.length - 1) !== raceRacers.length) {
        //store the original values
        var tmpSelectValue1 = selectID1.value;
        var tmpSelectValue2 = selectID2.value;
        var tmpSelectValue3 = selectID3.value;

        showSelectValue.length = 0;
        showSelectTxt.length = 0;

        //now reload the arrays for the drop down lists
        showSelectTxt.push(" ");
        showSelectValue.push(0);

        for (var i = 0; i < raceRacers.length; i++) {
            showSelectTxt.push(`${raceRacers[i].car} - ${raceRacers[i].racer_name}`);
            showSelectValue.push(raceRacers[i].car)
        }

        //clear the drop down lists
        removeSelectOptions(selectID1);
        removeSelectOptions(selectID2);
        removeSelectOptions(selectID3);

        //now reload the drop down lists with new racers
        loadSelect("bestShow-select-1", showSelectValue, "", showSelectTxt);
        loadSelect("bestShow-select-2", showSelectValue, "", showSelectTxt);
        loadSelect("bestShow-select-3", showSelectValue, "", showSelectTxt);

        //now select the correct value, set it to blank if racer not there anymore
        for (var i = 0; i < showSelectValue.length; i++) {
            if (selectID1.options[i].value === tmpSelectValue1) {
                selectID1.value = tmpSelectValue1;
            }
            if (selectID2.options[i].value === tmpSelectValue2) {
                selectID2.value = tmpSelectValue2;
            }
            if (selectID3.options[i].value === tmpSelectValue3) {
                selectID3.value = tmpSelectValue3;
            }
        }

        //now set the disabled options in each list
        selectID1.options[selectID2.selectedIndex].disabled = true;
        selectID1.options[selectID3.selectedIndex].disabled = true;

        selectID2.options[selectID1.selectedIndex].disabled = true;
        selectID2.options[selectID3.selectedIndex].disabled = true;

        selectID3.options[selectID1.selectedIndex].disabled = true;
        selectID3.options[selectID2.selectedIndex].disabled = true;
    }

    if (showID.style.display = "none") showID.style.display = "block";

    selectID1.onchange = function () {
        selectID2.disabled = false;

        if (selectID1.value === selectID2.value) {
            selectID2.selectedIndex = 0;
        }
        if (selectID1.value === selectID3.value) {
            selectID3.selectedIndex = 0;
        }

        //first re-enable all the options
        for (var i = 0; i < showSelectValue.length; i++) {
            selectID1.options[i].disabled = false;
            selectID2.options[i].disabled = false;
            selectID3.options[i].disabled = false;
        }
        //now set the selected options to disable in all lists
        selectID2.options[selectID1.selectedIndex].disabled = true;
        selectID3.options[selectID1.selectedIndex].disabled = true;

        //Now check other lists and disable
        if (selectID2.selectedIndex > 0) {
            selectID1.options[selectID2.selectedIndex].disabled = true;
            selectID3.options[selectID2.selectedIndex].disabled = true;
        }
        if (selectID3.selectedIndex > 0) {
            selectID1.options[selectID3.selectedIndex].disabled = true;
            selectID2.options[selectID3.selectedIndex].disabled = true;
        }
    }

    selectID2.onchange = function () {
        selectID3.disabled = false;

        if (selectID2.value === selectID3.value) {
            selectID3.selectedIndex = 0;
        }
        if (selectID2.value === selectID1.value) {
            selectID1.selectedIndex = 0;
        }
        //first re-enable all the options
        for (var i = 0; i < showSelectValue.length; i++) {
            selectID1.options[i].disabled = false;
            selectID2.options[i].disabled = false;
            selectID3.options[i].disabled = false;
        }
        //now set the selected options to disable in all lists
        selectID1.options[selectID2.selectedIndex].disabled = true;
        selectID3.options[selectID2.selectedIndex].disabled = true;

        //Now check other lists and disable
        if (selectID1.selectedIndex > 0) {
            selectID2.options[selectID1.selectedIndex].disabled = true;
            selectID3.options[selectID1.selectedIndex].disabled = true;
        }
        if (selectID3.selectedIndex > 0) {
            selectID1.options[selectID3.selectedIndex].disabled = true;
            selectID2.options[selectID3.selectedIndex].disabled = true;
        }
    }

    selectID3.onchange = function () {
        //selectID3.disabled = false;

        if (selectID3.value === selectID1.value) {
            selectID3.selectedIndex = 0;
        }
        if (selectID3.value === selectID2.value) {
            selectID2.selectedIndex = 0;
        }
        //first re-enable all the options
        for (var i = 0; i < showSelectValue.length; i++) {
            selectID1.options[i].disabled = false;
            selectID2.options[i].disabled = false;
            selectID3.options[i].disabled = false;
        }
        //now set the selected options to disable in all lists
        selectID2.options[selectID3.selectedIndex].disabled = true;
        selectID1.options[selectID3.selectedIndex].disabled = true;

        //Now check other lists and disable
        if (selectID2.selectedIndex > 0) {
            selectID1.options[selectID2.selectedIndex].disabled = true;
            selectID3.options[selectID2.selectedIndex].disabled = true;
        }
        if (selectID1.selectedIndex > 0) {
            selectID3.options[selectID1.selectedIndex].disabled = true;
            selectID2.options[selectID1.selectedIndex].disabled = true;
        }
    }
}

function saveWinners() {
    const showID = document.getElementById("bestShow-select");
    const showWinnersID = document.getElementById("bestShow-display");
    const selectID1 = document.getElementById("bestShow-select-1");
    const selectID2 = document.getElementById("bestShow-select-2");
    const selectID3 = document.getElementById("bestShow-select-3");

    if (showID.style.display = "block") showID.style.display = "none";

    if (selectID1.selectedIndex === 0 || selectID2.selectedIndex === 0 || selectID3.selectedIndex === 0) {return -1;}

    var index1 = checkKeyValue(racerStats, "car", selectID1.value);
    var index2 = checkKeyValue(racerStats, "car", selectID2.value);
    var index3 = checkKeyValue(racerStats, "car", selectID3.value);

      raceInformation.showWinners = {
        "1st": {
            "car": racerStats[index1].car,
            "racer_name": racerStats[index1].racer_name,
            "weight": racerStats[index1].weight,
            "rank": racerStats[index1].rank
        },
        "2nd": {
            "car": racerStats[index2].car,
            "racer_name": racerStats[index2].racer_name,
            "weight": racerStats[index2].weight,
            "rank": racerStats[index2].rank
        },
        "3rd": {
            "car": racerStats[index3].car,
            "racer_name": racerStats[index3].racer_name,
            "weight": racerStats[index3].weight,
            "rank": racerStats[index3].rank
        }
    };

    //console.log(raceInformation.showWinners);
    showWinners();
}

function loadWinners() {
    const showID = document.getElementById("bestShow-select");
    const selectID1 = document.getElementById("bestShow-select-1");
    const selectID2 = document.getElementById("bestShow-select-2");
    const selectID3 = document.getElementById("bestShow-select-3");

     

    if (raceInformation.hasOwnProperty("showWinners")) {
        var tmpSelectValue1 = raceInformation.showWinners["1st"].car;
        var tmpSelectValue2 = raceInformation.showWinners["2nd"].car;
        var tmpSelectValue3 = raceInformation.showWinners["3rd"].car;

        if (racerStats.length != 0 && raceRacers.length != 0) {

            if (showSelectValue.length <= 0) {
                showSelectTxt.push(" ");
                showSelectValue.push(0);
    
                for (var i = 0; i < raceRacers.length; i++) {
                    showSelectTxt.push(`${raceRacers[i].car} - ${raceRacers[i].racer_name}`);
                    showSelectValue.push(raceRacers[i].car)
                }
            }
            if (selectID1.options.length <= 0 && selectID2.options.length <= 0 && selectID3.options.length <= 0) {
                loadSelect("bestShow-select-1", showSelectValue, "", showSelectTxt);
                loadSelect("bestShow-select-2", showSelectValue, "", showSelectTxt);
                loadSelect("bestShow-select-3", showSelectValue, "", showSelectTxt);
                //console.log(selectID1);
            }
        }


        for (var i = 0; i < showSelectValue.length; i++) {
            if (selectID1.options[i].value === tmpSelectValue1) {
                selectID1.value = tmpSelectValue1;
            }
            if (selectID2.options[i].value === tmpSelectValue2) {
                selectID2.value = tmpSelectValue2;
            }
            if (selectID3.options[i].value === tmpSelectValue3) {
                selectID3.value = tmpSelectValue3;
            }
        }

        //now set the disabled options in each list
        selectID1.options[selectID2.selectedIndex].disabled = true;
        selectID1.options[selectID3.selectedIndex].disabled = true;

        selectID2.options[selectID1.selectedIndex].disabled = true;
        selectID2.options[selectID3.selectedIndex].disabled = true;

        selectID3.options[selectID1.selectedIndex].disabled = true;
        selectID3.options[selectID2.selectedIndex].disabled = true;

        showWinners();
    }
}

function showWinners() {
    const showID = document.getElementById("bestShow-select");
    const showWinnersID = document.getElementById("bestShow-display");
    const selectID1 = document.getElementById("bestShow-select-1");
    const selectID2 = document.getElementById("bestShow-select-2");
    const selectID3 = document.getElementById("bestShow-select-3");
    const buttonShow = document.getElementById("bestShowButton");
    const buttonHide = document.getElementById("bestHideButton");

    if (!isObjEmpty(raceInformation.showWinners)){

        //create the txt first
        var tmpText = "";
        tmpText += `<div class='flex-container-row' style='perspective: 200px;'>`;
        tmpText += `<div class='first_place'>`;
        tmpText += `<h1>1<sup>st</sup> Place <span class='winner'>&#xf091;</span></h1>`;
        tmpText += `<img id='imgShowWinner-1' src='${getImage(raceInformation.showWinners["1st"].rank)}'>`;
        tmpText += `<p>${raceInformation.showWinners["1st"].racer_name}</p>`;
        tmpText += `<p># ${raceInformation.showWinners["1st"].car}</p>`;
        tmpText += `</div>`
        tmpText += `<div class='second_place'>`;
        tmpText += `<h1>2<sup>nd</sup> Place</h1>`;
        tmpText += `<img id='imgShowWinner-2' src='${getImage(raceInformation.showWinners["2nd"].rank)}'>`;
        tmpText += `<p>${raceInformation.showWinners["2nd"].racer_name}</p>`;
        tmpText += `<p># ${raceInformation.showWinners["2nd"].car}</p>`;
        tmpText += `</div>`
        tmpText += `<div class='third_place'>`;
        tmpText += `<h1>3<sup>rd</sup> Place</h1>`;
        tmpText += `<img id='imgShowWinner-3' src='${getImage(raceInformation.showWinners["3rd"].rank)}'>`;
        tmpText += `<p>${raceInformation.showWinners["3rd"].racer_name}</p>`;
        tmpText += `<p># ${raceInformation.showWinners["3rd"].car}</p>`;
        tmpText += `</div>`;
        tmpText += `</div>`;

        //now place it in the div
        showWinnersID.innerHTML = tmpText;

        if (showWinnersID.style === "none") showWinnersID.style = "block";

        buttonHide.disabled = false;
        buttonShow.disabled = false;

        ipcRenderer.send('best-show-results', raceInformation.showWinners);
    }
}

function bestShowSpec(type){

    if (!isObjEmpty(raceInformation.showWinners)) {
        ipcRenderer.send('best-show-results', raceInformation.showWinners);
    }
    ipcRenderer.send('best-show-window', type);
}

function getImage(rank) {
    switch (rank) {
      case "Tiger":
        return tigerImg;
  
      case "Wolf":
        return wolfImg;
  
      case "Bear":
        return bearImg;
  
      case "Webelos":
        return webelosImg;
  
      case "AOL":
        return aolImg;
  
      default:
        return defaultImg;
    }
  }