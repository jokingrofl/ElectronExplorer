const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const MenuItem = electron.MenuItem;
const spawn = require('child_process').spawn;
const os = require("os");
const homedir = require('os').homedir();
var selectedUrl = '';
var selectedElement;


const {app, BrowserWindow, Menu, ipcMain, shell} = electron;

let mainWindow;
var currentDirectory;

//context menus
const ctxImage = new Menu();
global.contextMenu = ctxImage;
const ctxMenu = new Menu();
global.genCM = ctxMenu;

//listen for app to be ready
app.on('ready', function(){
    //create new window
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        //for custom translucent title bar, note resizing does not work atm
        frame: false,
        transparent: true,
        vibrancy: "ultra-dark"
    });
    //load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    var usingMenu = false;

    if (usingMenu){
    //build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //insert menu
    Menu.setApplicationMenu(mainMenu);
    }

    const openFileLocation = new MenuItem({
        label: "Open file location",
        click: function(menu, window, event){
            var item = selectedUrl.replaceAll('/', '\\');
            console.log("Opening " + item + " in file explorer");
            shell.showItemInFolder(item);
        }
    });

    const toggleDevTools = new MenuItem({
        role: "toggleDevtools"
    });

    const getInfo = new MenuItem({
        label: "Get Info",
        click: (menu, window, event) =>{
            mainWindow.webContents.send('getInfo');
        }
    })
    
    ctxImage.append(openFileLocation);
    ctxImage.append(toggleDevTools);
    ctxImage.append(getInfo);
    ctxMenu.append(toggleDevTools);
    ctxMenu.append(getInfo);

    mainWindow.webContents.on('context-menu', function(e, params){
        selectedUrl = params.srcURL.substr(8);
        selectedUrl = selectedUrl.replace("//", "/");
        selectedUrl = decodeURI(selectedUrl);
        
        console.log(selectedUrl);
        //ctxMenu.popup(mainWindow, params.x, params.y);
    });
});

const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item'
            },
            {
                label: 'Clear Items'
            },
            {
                label: 'Quit',
                click(){
                    app.quit();
                }
            }
        ]
    }

];

ipcMain.on('Start', (e) => {
    console.log("Start button pressed");
    mainWindow.webContents.send("Clear");
    currentDirectory = homedir;
    mainWindow.webContents.send("directoryName", currentDirectory);
    var contents = fs.readdirSync(currentDirectory);
    console.log(contents);

    var directories = contents.filter((value, index, arr) => {
        var fullPath = currentDirectory + "/" + value;
        var stats = fs.statSync(fullPath);
        return stats.isDirectory();
    });
    mainWindow.webContents.send('directories', directories);

    var files = contents.filter((value, index, arr) => {
        var fullPath = currentDirectory + "/" + value;
        var stats = fs.statSync(fullPath);
        return stats.isFile();
    });
    mainWindow.webContents.send('files', files);
    
    console.log("Sent contents");
});


ipcMain.on('getDirectory', function(e, directory){
    directory = path.normalize(directory);
    console.log("Running getDirectory for path " + directory);
    currentDirectory = directory;
    mainWindow.webContents.send("Clear");
    mainWindow.webContents.send('directoryName', directory);
    try{
        var contents = fs.readdirSync(directory);
        console.log(contents);

        var directories = contents.filter((value, index, arr) => {
            var fullPath = currentDirectory + "/" + value;
            try {
                var stats = fs.statSync(fullPath);
                return stats.isDirectory();
            }
            catch(error){
                console.log(error);
                return false;
            }
            
        });
        mainWindow.webContents.send('directories', directories);
    
        var files = contents.filter((value, index, arr) => {
            var fullPath = currentDirectory + "/" + value;
            try{
                var stats = fs.statSync(fullPath);
                return stats.isFile();
            }
            catch(error){
                console.log(error);
                return false;
            }
            
        });
        mainWindow.webContents.send('files', files);
        
        console.log("Sent contents");
    }
    catch(err){
        console.log(err);
        mainWindow.webContents.send('alert', "Error retrieving information on " + directory + "\nThis is most likely a permission error");
    }
});

ipcMain.on('File', function(e, filePath){
    console.log("Attempting to open file");

    if (isImage(filePath)){
        console.log("Detected image file");
        var selectedImage = filePath;
        filePath = filePath.substring(0, filePath.lastIndexOf("\\")+1);
        var files = fs.readdirSync(filePath);
        var filtered = files.filter(function(value, index, arr){
            if (value.indexOf('.jpg') >= 0 || value.indexOf('.png') >= 0 ||
            value.indexOf('.gif') >= 0){
                return true;
            }
            else
                return false;
        });
        mainWindow.webContents.send('dirName', filePath);
        mainWindow.webContents.send('files', filtered);
        mainWindow.webContents.send('image', selectedImage);
    }
});

ipcMain.on('getFirstImage', (e, dir_path) => {
    try{
    var files = fs.readdirSync(dir_path);
    var filtered = files.filter((value, index, arr) => {
        return isImage(value);
    });
    if (filtered.length > 0){
        full_path = path.join(dir_path, filtered[0]);
        mainWindow.webContents.send('firstImage', full_path);
        console.log("Sent first image: " + full_path);
    }
    else
        console.log("Found no images in path: " + dir_path);
    }
    catch(exception){
        console.log("Error getting information on " + dir_path);
        console.log(exception);
    }
    
        
});

function isImage(name){
    let str = name.toLowerCase();
    return (str.includes('.jpg') || str.includes('.jpeg') || str.includes('png') ||
    str.includes('gif'));
}

function isVideo(name){
    return (name.indexOf('.mp4') >= 0);
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
}