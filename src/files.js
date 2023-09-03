const electron = require('electron');
const { shell } = require('electron');
const { ipcRenderer } = electron;

var remote = require('@electron/remote');
var dialog = remote.dialog;
var largeThumbs = false;
var hover_zoom = true;
var fullscreen = false;

var current_directory;
var saved_directories;
var saved_files;
var dir_stack = [];

//get directory onclick event
function onButton() {
    const input = document.getElementById("textBox1");
    console.log(input.value);
    clearContent();
    ipcRenderer.send('getDirectory', input.value);
}

function search(){
    const input = document.getElementById("textBox1");
    const searchQuery = document.getElementById("searchBox");
    clearContent();
    ipcRenderer.send('getDirectory', input.value, searchQuery.value);
}

function goToDir(directory) {
    clearContent();
    ipcRenderer.send('getDirectory', directory);
}

function refresh(){
    goToDir(current_directory);
}

//delete all elements in content
function clearContent() {
    var content = document.getElementById("content");
    content.innerHTML = "";
    items = [];
}

function back() {
    clearContent();
    dir_stack.pop();
    ipcRenderer.send('getDirectory', dir_stack.pop());
}

function up() {
    current_directory = current_directory + "/..";
    ipcRenderer.send('getDirectory', current_directory);
}

function openFile(filePath) {
    console.log("Opening " + filePath);
    shell.openItem(filePath);
}

function toggleThumbs() {
    largeThumbs = !largeThumbs;
}

function createFolder(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

function closeFolderPrompt(){
    document.getElementById("textPrompt").style.display = "none";
}

function openFolderPrompt(){
    document.getElementById("textPrompt").style.display = "block";
    document.getElementById("folderName").focus();
}

function newFolderHandler(){
    newFolder(document.getElementById("folderName").value);
    closeFolderPrompt();
}

function newFolder(name){
    if(name)
        createFolder(current_directory + "/" + name);
    else
        createFolder(current_directory + "/new folder");
    refresh();
}

document.getElementById('searchBox').addEventListener("keyup", e => {
    if(e.keyCode === 13){
        e.preventDefault();
        document.getElementById('searchButton').click();
    }
});

let folderNameTextbox = document.getElementById('folderName');
   folderNameTextbox.addEventListener("keyup", (e) =>{
    if (e.keyCode === 13){ //if key is enter
        e.preventDefault();
        let enter_button = document.getElementById('folderPromptCreate');
        enter_button.click();
    }
   });