function selectWinners () {
    const showID = document.getElementById("bestShow-select");
    const selectID1 = document.getElementById("bestShow-select-1");
    const selectID2 = document.getElementById("bestShow-select-2");
    const selectID3 = document.getElementById("bestShow-select-3");
    
    if (racerStats.length != 0){

        showSelectTxt.push(" ");
        showSelectValue.push(0);

        for (var i =0; i < racerStats.length; i++) {
            showSelectTxt.push(`${racerStats[i].car} - ${racerStats[i].racer_name}`);
            showSelectValue.push(racerStats[i].car)
        }
        
        loadSelect("bestShow-select-1", showSelectValue,"",showSelectTxt);
        loadSelect("bestShow-select-2", showSelectValue,"",showSelectTxt);
        loadSelect("bestShow-select-3", showSelectValue,"",showSelectTxt);
        console.log(selectID1);
    } else {
        dialog.showErrorBox("No Racers Loaded", "Please enter some racers into the race.");
        return -1;
    }

    if (showID.style.display ="none") showID.style.display = "block";

selectID1.onchange = function(){
    selectID2.disabled = false;
    selectID2.options[selectID1.selectedIndex].disabled = true;
}

}