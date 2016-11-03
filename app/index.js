//const electron = require('electron');
//const remote = electron.remote;
//const dialog = electron.remote.dialog;
//const shell = electron.shell;
//const fs = require('fs');
//const ipcRenderer = electron.ipcRenderer;



function onBodyLoad(){
  document.getElementById("mainT").style.display = "block";
  //document.getElementById("mainTabLi").className += " active";
  //document.activeElement.blur();
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
}
