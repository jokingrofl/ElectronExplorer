const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const MenuItem = electron.MenuItem;
const spawn = require('child_process').spawn;
const os = require("os");
const { ipcRenderer } = require('electron');
const homedir = require('os').homedir();
var selectedUrl = '';
var selectedElement;


const { app, BrowserWindow, Menu, ipcMain, shell, globalShortcut } = electron;

let mainWindow;
var currentDirectory;
let fileWatcher = null;
let quickList = [];

const electronExPath = os.homedir() + path.sep + "Documents" + path.sep + "Electron Explorer";
const quickListPath = electronExPath + path.sep + "quickList.txt";

//context menus
const ctxImage = new Menu();
global.contextMenu = ctxImage;
const ctxMenu = new Menu();
global.genCM = ctxMenu;

//listen for app to be ready
app.on('ready', function () {

    //keyboard shortcuts
    globalShortcut.register('CommandOrControl+M', () => {
        mainWindow.minimize();
    });

    globalShortcut.register('Home', () => {
        mainWindow.webContents.send('Home');
    });


    //create new window
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        },
        //for custom translucent title bar, note resizing does not work atm
        frame: false,
        transparent: true,
        vibrancy: "ultra-dark"
    });
    //load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'src/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    var usingMenu = false;

    if (usingMenu) {
        //build menu from template
        const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
        //insert menu
        Menu.setApplicationMenu(mainMenu);
    }

    const openFileLocation = new MenuItem({
        label: "Open file location",
        click: function (menu, window, event) {
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
        click: (menu, window, event) => {
            mainWindow.webContents.send('getInfo');
        }
    })

    const moveToTrash = new MenuItem({
        label: "Move to Trash",
        click: (menu, window, event) => {
            mainWindow.webContents.send('delete');
        }
    });

    const rename = new MenuItem({
        label: "Rename",
        click: (menu, window, event) => {
            mainWindow.webContents.send('rename');
        }
    });

    const copy = new MenuItem({
        label: "Copy",
        click: (menu, window, event) => {
            mainWindow.webContents.send('copy');
        }
    });

    const cut = new MenuItem({
        label: "Cut",
        click: (menu, window, event) => {
            mainWindow.webContents.send('cut');
        }
    });

    const paste = new MenuItem({
        label: "Paste",
        click: (menu, window, event) => {
            mainWindow.webContents.send('paste');
        }
    });

    const addQuickList = new MenuItem({
        label: "Add current directory to quicklist",
        click: (menu, window, event) => {
            mainWindow.webContents.send('addQuicklist');
        }
    });

    ctxImage.append(openFileLocation);
    ctxImage.append(rename);
    ctxImage.append(toggleDevTools);
    ctxImage.append(getInfo);
    ctxImage.append(moveToTrash);
    ctxImage.append(copy);
    ctxImage.append(cut);
    ctxImage.append(paste);
    ctxImage.append(addQuickList);
    ctxMenu.append(rename);
    ctxMenu.append(toggleDevTools);
    ctxMenu.append(getInfo);
    ctxMenu.append(moveToTrash);
    ctxMenu.append(copy);
    ctxMenu.append(cut);
    ctxMenu.append(paste);
    ctxMenu.append(addQuickList);
    

    mainWindow.webContents.on('context-menu', function (e, params) {
        selectedUrl = params.srcURL.substr(8);
        selectedUrl = selectedUrl.replace("//", "/");
        selectedUrl = decodeURI(selectedUrl);

        console.log(selectedUrl);
        //ctxMenu.popup(mainWindow, params.x, params.y);
    });

    //load quickList
    if (fs.existsSync(quickListPath)) {
        const readInterface = readline.createInterface({
            input: fs.createReadStream(quickListPath),
            output: process.stdout,
            console: false
        });
        readInterface.on('line', line => {
            quickList.push(line);
        });
        readInterface.on('close', line => {
            console.log("Done reading quicklist");
        });
    }
    else {
        if (!fs.existsSync(electronExPath)) {
            fs.mkdirSync(electronExPath);
            console.log("Created application directory");
        }
        console.log("quickList not found");
    }
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
                click() {
                    app.quit();
                }
            }
        ]
    }

];

//open home directory
ipcMain.on('Start', (e) => {
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

//get the contents of directory and return file names to renderer
ipcMain.on('getDirectory', function (e, directory, searchQuery) {
    directory = path.normalize(directory);
    console.log("Running getDirectory for path " + directory);
    currentDirectory = directory;
    mainWindow.webContents.send("Clear");
    mainWindow.webContents.send('directoryName', directory);
    try {
        var contents = fs.readdirSync(directory);
        //console.log(contents);

        var directories = contents.filter((value, index, arr) => {
            var fullPath = currentDirectory + "/" + value;
            try {
                var stats = fs.statSync(fullPath);
                return searchQuery ? (value.indexOf(searchQuery) > -1) && stats.isDirectory() : stats.isDirectory();
                //return stats.isDirectory();
            }
            catch (error) {
                console.log(error);
                return false;
            }

        });
        mainWindow.webContents.send('directories', directories);

        var files = contents.filter((value, index, arr) => {
            var fullPath = currentDirectory + "/" + value;
            try {
                var stats = fs.statSync(fullPath);
                return searchQuery ? (value.indexOf(searchQuery) > -1) && stats.isFile() : stats.isFile();
                //return stats.isFile();
            }
            catch (error) {
                console.log(error);
                return false;
            }

        });
        mainWindow.webContents.send('files', files);

        console.log("Sent contents");

        //watch directory for changes
        if (fileWatcher != null) fileWatcher.close();
        fileWatcher = fs.watch(currentDirectory, (event, fileName) => {
            if (fileName) {
                console.log(fileName + ' changed');
                console.log(event);
            }
        });

    }
    catch (err) {
        console.log(err);
        mainWindow.webContents.send('alert', "Error retrieving information on " + directory + "\nThis is most likely a permission error");
    }
});

ipcMain.on('File', function (e, filePath) {
    console.log("Attempting to open file");

    if (isImage(filePath)) {
        console.log("Detected image file");
        var selectedImage = filePath;
        filePath = filePath.substring(0, filePath.lastIndexOf("\\") + 1);
        var files = fs.readdirSync(filePath);
        var filtered = files.filter(function (value, index, arr) {
            if (value.indexOf('.jpg') >= 0 || value.indexOf('.png') >= 0 ||
                value.indexOf('.gif') >= 0) {
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

ipcMain.on('quickList', e => {
    console.log("Sending quicklist to renderer");
    mainWindow.webContents.send("quickList", quickList);
});

function isImage(name) {
    let str = name.toLowerCase();
    return (str.includes('.jpg') || str.includes('.jpeg') || str.includes('.png') ||
        str.includes('.gif') || str.includes('.webp'));
}

function isVideo(name) {
    return (name.indexOf('.mp4') >= 0);
}

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
}