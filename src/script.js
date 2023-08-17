
var zoomed = false;
var autoPreview = false;
var current = 0;
var curStr = "";
var debugging = false;
var fixed = false;
var rightClickedElement;
var hoveredElement;
var breadPaths;
let quickList = [];
const { fstat } = require("fs");
const os = require("os");
let quickFilePath = path.join(os.homedir(), "Documents", "Electron Explorer", "quickList.txt");

function showQuickList() {
    document.getElementById("quickList").style.width = "250px";
}

function addQuickList() {
    let pathBox = document.getElementById("textBox1");
    let quickPath = pathBox.value;
    console.log(`${quickPath} path being added to quicklist`);
    let newQItem = new Quick_Item(quickPath);
    quickList.push(newQItem);
    writeQuickFile();
}

function writeQuickFile() {
    let data = "";
    for (item of quickList) {
        data += item.path + "\n";
    }
    fs.writeFile(quickFilePath, data, e => {
        console.log("Saved quicklist");
    });
}

function closeQuickList() {
    document.getElementById("quickList").style.width = "0";
}

function previewAll() {
    for (item of items) {
        item.appendImage();
    }
}

function togglePreview() {
    var checkbox = document.getElementById('autoPreview');
    autoPreview = !autoPreview;
}

function toggleZoom() {
    var checkbox = document.getElementById('zoomCheck');
    var images = document.querySelectorAll('#content img')
    var i;
    console.log(images.length);
    console.log(checkbox.checked);

    if (!checkbox.checked) {
        for (i = 0; i < images.length; i++) {
            images[i].classList.remove('zoom-hover');
        }
        hover_zoom = false;
    }
    else {
        for (i = 0; i < images.length; i++) {
            images[i].classList.add('zoom-hover');
        }
        hover_zoom = true;
    }
}

function toggleAbout() {
    var about = document.getElementById("about");
    if (about.style.display != "block") {
        about.style.display = "block";
    }
    else {
        about.style.display = "none";
    }

    closeNav();
}

function toggleNav() {
    var sideNav = document.getElementById("mySidenav");
    console.log(sideNav.style.width);
    if (sideNav.style.width == "0px" || sideNav.style.width == "") {
        openNav();
    }
    else {
        closeNav();
    }
}

/* Set the width of the side navigation to 250px */
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

//onclick for content images, shows modal
function onClick(element) {
    document.getElementById("img01").src = element.src;
    document.getElementById("myModal").style.display = "block";
    var captionText = document.getElementById("caption");
    captionText.innerHTML = element.alt;
    curStr = element.src;
    var buttons = document.getElementById("buttons");
    if (buttons.classList.contains('fixed')) {
        buttons.classList.remove('fixed');
    }
}

function next() {
    var images = document.querySelectorAll('#content img');
    var srcList = [];
    for (var i = 0; i < images.length; i++) {
        srcList.push(images[i].src);
    }

    console.log(current);
    current = 0;
    for (var i = 0; i < srcList.length; i++) {
        if (srcList[i] === curStr) {
            current = i;
            //console.log("Match found: current set to " + i + "\n");
            break;
        }
    }

    var image = document.getElementById("img01");
    current = (++current >= srcList.length) ? srcList.length - 1 : current;
    image.src = srcList[current];
    curStr = image.src;
    var captionText = document.getElementById("caption");
    var e = images[current];
    captionText.innerHTML = e.alt;
}

function prev() {
    var images = document.getElementsByTagName('img');
    var srcList = [];
    for (var i = 0; i < images.length; i++) {
        srcList.push(images[i].src);
    }

    console.log(current);
    current = 0;
    for (var i = 0; i < srcList.length; i++) {
        if (srcList[i] === curStr) {
            current = i;
            //console.log("Match found: current set to " + i + "\n");
            break;
        }
    }

    var image = document.getElementById("img01");
    if (--current < 0) { return; }
    image.src = srcList[current];
    curStr = image.src;
    var captionText = document.getElementById("caption");
    var e = images[current];
    captionText.innerHTML = e.alt;
}

//zoom in on modal image
function zoom(element) {
    var image = document.getElementById("img01");
    if (!zoomed) {
        image.style.transform = 'scale(2)';
        image.style.animationName = 'zoom2';
        var style = (image.width * -1) / 2;
        const str = style.toString() + "px";
        image.style.left = str;
        console.log("Constant: " + str);
        console.log("Applied style: " + image.style.left);
        zoomed = true;
    }
    else {
        image.style.left = "";
        image.style.transform = 'scale(1)';
        image.style.animationName = 'zoomOut';
        zoomed = false;
    }
}

var zoom_val = 1.0;

function zoomIn() {
    var image = document.getElementById("img01");
    zoom_val += 0.1;
    image.style.transform = 'scale(' + zoom_val + ')';
}

function zoomOut() {
    var image = document.getElementById("img01");
    zoom_val -= 0.1;
    image.style.transform = 'scale(' + zoom_val + ')';
}

function updateDir() {
    console.log("updateDir called");
    var pathBox = document.getElementById('textBox1');
    var paths = parsePath(pathBox.value);
    var container = document.getElementById('breadcrumbs');
    container.innerHTML = '';
    for (let i = 0; i < paths.length; i++) {
        var breadcrumb = document.createElement('button');
        breadcrumb.innerHTML = paths[i];
        //breadcrumb.setAttribute('value', paths[i]);
        breadcrumb.setAttribute('class', 'button');
        breadcrumb.setAttribute('onclick', 'openBread(' + i + ")");
        container.appendChild(breadcrumb);
    }
}

function openBread(index) {
    console.log("openBread: " + index);
    var fullPath = "";
    for (let i = 0; i < index + 1; i++) {
        fullPath += breadPaths[i] + "/";
    }
    console.log(breadPaths[index]);
    console.log(fullPath);
    ipcRenderer.send('getDirectory', fullPath);
}

function parsePath(path) {
    var paths = [];
    var start = 0;
    for (let i = 0; i < path.length; i++) {
        //console.log("Checking: " + path[i] + " at index " + i);
        if (path[i] === '\\' || path[i] === '/') {
            //console.log("Found slash");
            //console.log("Start value: " + start);
            paths.push(path.substr(start, i - start));
            start = i + 1;
        }
        else {
            if (path.substr(i).indexOf('\\') < 0 && path.substr(i).indexOf('/') < 0) {
                paths.push(path.substr(i));
                break;
            }
        }
    }
    console.log(paths);
    breadPaths = paths;
    return paths;
}

if (debugging) {
    document.onmousemove = function (e) {
        var debug = document.getElementById("debug");
        var text = "X: " + e.clientX + ", Y: " + e.clientY + " OffsetX: " + e.offsetX + " OffsetY: " + e.offsetY;
        debug.innerHTML = text;
    }

    document.onclick = function (e) {
        var image = document.getElementById('img01');
        //console.log(image);
        var origin = e.offsetX + " " + e.offsetY;
        //image.style.transformOrigin += origin;

        image.style.transformOrigin = "400 600";
        //console.log(origin);
        //console.log(image.style.transformOrigin);
    }
}
else {
    var text = document.getElementById("debug");
    text.style.display = "none";
}

document.onclick += (e) => {
    console.log(e.target);
};

function start() {
    ipcRenderer.send('Start');
}

function selectElement(element) {
    console.log(element);
    if (element.classList.contains('selected')) {
        element.classList.remove('selected');
    }
    else {
        element.classList.add('selected');
    }
};



function showFiles() {
    for (let i = 0; i < items.length; i++) {
        console.log(items[i]);
    }
}

let textBox = document.getElementById('textBox1');
textBox.addEventListener("keyup", (e) => {
    if (e.keyCode === 13) { //if key is enter
        e.preventDefault();
        onButton();
    }
});

ipcRenderer.send("quickList");