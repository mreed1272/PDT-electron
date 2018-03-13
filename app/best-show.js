function selectWinners() {
    const showID = document.getElementById("bestShow-select");
    const selectID1 = document.getElementById("bestShow-select-1");
    const selectID2 = document.getElementById("bestShow-select-2");
    const selectID3 = document.getElementById("bestShow-select-3");

    if (racerStats.length != 0) {

        showSelectTxt.push(" ");
        showSelectValue.push(0);

        for (var i = 0; i < racerStats.length; i++) {
            showSelectTxt.push(`${racerStats[i].car} - ${racerStats[i].racer_name}`);
            showSelectValue.push(racerStats[i].car)
        }

        loadSelect("bestShow-select-1", showSelectValue, "", showSelectTxt);
        loadSelect("bestShow-select-2", showSelectValue, "", showSelectTxt);
        loadSelect("bestShow-select-3", showSelectValue, "", showSelectTxt);
        console.log(selectID1);
    } else {
        dialog.showErrorBox("No Racers Loaded", "Please enter some racers into the race.");
        return -1;
    }

    if (showID.style.display = "none") showID.style.display = "block";

    selectID1.onchange = function () {
        selectID2.disabled = false;

        if (selectID1.value === selectID2.value) {
            selectID2.selectedIndex = 0;
        }
        if (selectID1.value === selectID3.value){
            selectID3.selectedIndex = 0;
        }
        for (var i = 0; i < showSelectValue.length; i++) {
            if (selectID1.value === selectID2.options[i].value) {
                selectID2.options[i].disabled = true;
                selectID3.options[i].disabled = true;
            } else {
                selectID2.options[i].disabled = false;
                //selectID3.options[i].disabled = false;
            }
            if (selectID1.value === selectID3.options[i].value) {
                //selectID2.options[i].disabled = true;
                selectID3.options[i].disabled = true;
            } else {
                //selectID2.options[i].disabled = false;
                selectID3.options[i].disabled = false;
            }
        }
    }

    selectID2.onchange = function () {
        selectID3.disabled = false;

        if (selectID2.value === selectID3.value) {
            selectID3.selectedIndex = 0;
        }
        if (selectID2.value === selectID1.value){
            selectID1.selectedIndex = 0;
        }
        for (var i = 0; i < showSelectValue.length; i++) {
            if (selectID2.value === selectID3.options[i].value) {
                selectID3.options[i].disabled = true;
                //selectID3.options[i].disabled = true;
            } else {
                selectID3.options[i].disabled = false;
                //selectID3.options[i].disabled = false;
            }
            if (selectID2.value === selectID1.options[i].value) {
                //selectID2.options[i].disabled = true;
                selectID1.options[i].disabled = true;
            } else {
                //selectID2.options[i].disabled = false;
                selectID1.options[i].disabled = false;
            }
        }
    }
    
    selectID3.onchange = function () {
        //selectID3.disabled = false;

        if (selectID3.value === selectID1.value) {
            selectID3.selectedIndex = 0;
        }
        if (selectID3.value === selectID2.value){
            selectID2.selectedIndex = 0;
        }
        for (var i = 0; i < showSelectValue.length; i++) {
            if (selectID3.value === selectID1.options[i].value) {
                selectID1.options[i].disabled = true;
                //selectID3.options[i].disabled = true;
            } else {
                selectID1.options[i].disabled = false;
                //selectID3.options[i].disabled = false;
            }
            if (selectID3.value === selectID2.options[i].value) {
                //selectID2.options[i].disabled = true;
                selectID2.options[i].disabled = true;
            } else {
                //selectID2.options[i].disabled = false;
                selectID2.options[i].disabled = false;
            }
        }
    }
}