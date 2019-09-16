
function togglePopUp(){
    var popUp = document.getElementById("popUp01");
    if (popUp.style.display != "block")
        popUp.style.display = "block";
    else
        popUp.style.display = "none";
    closeNav();
};

function displayAllStats(){
    ipcRenderer.send('calc');
   };

function displayStats(stats){
    var popUp = document.getElementById('popUp01');
    document.getElementById('popUpTitle').innerText = "File Details";
    var statsText = "Path: " + rightClickedElement.getAttribute('data-path');
    var size = stats.size / 1000000;
    statsText += "\nSize: " + size + " megabytes";
    statsText += "\nCreated: " + stats.ctime;
    statsText += "\nModified: " + stats.mtime;
    statsText += "\nAccessed: " + stats.atime;
    document.getElementById('popUpText').innerText = statsText;
    togglePopUp();
};

function customAlert(alert){
    document.getElementById('popUpTitle').innerText = alert;
    document.getElementById('popUpText').innerText = "";
    togglePopUp();
};