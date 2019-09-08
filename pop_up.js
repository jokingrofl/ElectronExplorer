
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
    document.getElementById('modName').innerText = "File Details";
    var statsText = "Name: " + rightClickedElement.getAttribute('src');
    var size = stats.size / 1000000;
    statsText += "\nSize: " + size + " megabytes";
    statsText += "\nCreated: " + stats.ctime;
    statsText += "\nModified: " + stats.mtime;
    statsText += "\nAccessed: " + stats.atime;
    //var statsText = "Size: " + stats;
    document.getElementById('statsList').innerText = statsText;
    togglePopUp();
};

function displayInfo(info){
    var popUp = document.getElementById('popUp01');
    document.getElementById('modName').innerText = "Favorites Details";
    var statsText = "Favorites count: " + info.length;
    statsText += "\nSize: " + info.size + " megabytes";
    document.getElementById('statsList').innerText = statsText;
    togglePopUp();
};

function customAlert(alert){
    document.getElementById('popUpTitle').innerText = alert;
    document.getElementById('popUpText').innerText = "";
    togglePopUp();
};