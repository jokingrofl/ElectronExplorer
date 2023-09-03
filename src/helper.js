//const drivelist = require('drivelist');
/*
const thumbsupply = require('thumbsupply');

function createThumbnail(videoSrc){
    thumbsupply.generateThumbnail(videoSrc, {
        size: thumbsupply.ThumbSize.MEDIUM, // or ThumbSize.LARGE
        timestamp: "10%", // or `30` for 30 seconds
        forceCreate: true,
        cacheDir: "~cache",
        mimetype: "video/mp4"
    }).then(thumb => {
        console.log(thumb);
    });
}
*/

//titlebar button functions ----------------------------------------------------
function maximize(){
    var window = remote.getCurrentWindow();
    if (window.isMaximized()){
        window.unmaximize();
    }
    else {
        window.maximize();
    }
}

function minimize(){
    var window = remote.getCurrentWindow();
    window.minimize();
}

function quit(){
    var window = remote.getCurrentWindow();
    window.close();
}


//dragging functions ------------------------------------------------------------------
document.ondragover = function(){
    return false;
}

document.ondragleave = function(){
    return false;
}

document.ondragend = function(){
    return false;
}

document.ondrop = function(e){
    /*
    e.stopPropagation();
    e.preventDefault();
    */
   console.log("ondrop activated");
    var files = e.dataTransfer.files;
    console.log(files);
    console.log(files[0].path);
    ipcRenderer.send('File', files[0].path);
}

//helper functions ---------------------------------------------------------------

const levenshtein = require('js-levenshtein');

//remove file:// and %20 from path string
function formatPath(p){
    return decodeURI(p.substring(8));
}

function isImage(name){
    let str = name.toLowerCase();
    return (str.includes('.jpg') || str.includes('.jpeg') || str.includes('.png') ||
    str.includes('.gif') || str.includes('.webp'));
}

function isVideo(name){
    return (name.indexOf('.mp4') >= 0 || name.indexOf('.MP4') >= 0);
}

//detect keyboard presses, used for cycling images with arrow keys etc. ----------------------
function myKeyDown(e){
    if (document.activeElement.type === "text"){
        return;
    }
    var keynum;
    if(window.event) { // IE                    
      keynum = e.keyCode;
      //console.log("IE?\n");
    } else if(e.which){ // Netscape/Firefox/Opera                   
      keynum = e.which;
      //console.log("Others?\n");
    }
    if (keynum == 68 || keynum == 39){ //if key is D or right arrow
        next();
    }
    if (keynum == 37 || keynum == 65){ //if key is A or left arrow
        prev();
    }
    if (keynum == 27 && modal.style.display == "none"){
        up();
    }
    else
    if (keynum == 27){ //if key is esc, closes modal
        modal.style.display = "none";
  var image = document.getElementById("img01");
  image.style.animationName = 'zoom';
    }
    if (keynum == 38 || keynum == 87){ //up arrow
        zoomIn();
    }
    if (keynum == 40 || keynum == 83){ //down arrow
        zoomOut();
    }
    if (keynum == 77){ //m key
        //remote.getCurrentWindow().minimize();
    }


    console.log("Reached end of function: " + keynum);
  }

  document.onkeydown = myKeyDown;