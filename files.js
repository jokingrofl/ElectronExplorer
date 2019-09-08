const electron = require('electron');
const {shell} = require('electron');
const {ipcRenderer} = electron;

var remote = electron.remote;
var dialog = remote.dialog;
var largeThumbs = false;
var hover_zoom = true;
var fullscreen = false;

var current_directory;
var saved_directories;
var saved_files;
var dir_stack = [];

//get directory onclick event
function onButton(){
    const input = document.getElementById("textBox1");
    console.log(input.value);
    if (input.value.indexOf('.txt') >= 0){
        clearContent();
        ipcRenderer.send('File', input.value);
    }
    else{
        clearContent();
        ipcRenderer.send('getDirectory', input.value);
    }
}

//delete all elements in content
function clearContent(){
    var content = document.getElementById("content");
    content.innerHTML = "";
    items = [];
}

function back(){
    clearContent();
    dir_stack.pop();
    ipcRenderer.send('getDirectory', dir_stack.pop());
}

function up(){
    current_directory = current_directory + "/..";
    ipcRenderer.send('getDirectory', current_directory);
}

function openFile(filePath){
    console.log("Opening " + filePath);
    shell.openItem(filePath);
}

function toggleThumbs(){
    largeThumbs = !largeThumbs;
}