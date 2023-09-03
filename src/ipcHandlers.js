//const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const Queue = require('./queue.js');
const { log } = require('console');
var items = [];
const actionsQ = new Queue();
let copyClipboard = null;

ipcRenderer.on('alert', (e, message) => {
    customAlert(message);
});

ipcRenderer.on('quickList', (e, message) => {
    console.log("Received quicklist");
    let quickListPaths = message;
    let quickEl = document.getElementById("quickList");
    for (item of quickListPaths) {
        let newQuick = document.createElement("a");
        let newQItem = new Quick_Item(item, newQuick);
        quickList.push(newQItem);
        quickEl.appendChild(newQuick);
    }
});

ipcRenderer.on('addQuicklist', (e) => {
    addQuickList();
});

//handle response from main app
ipcRenderer.on('files', function (e, files) {
    var content = document.getElementById("content");
    saved_files = [...files];
    for (let i = 0; i < files.length; i++) {
        var container = document.createElement('div');
        container.setAttribute('class', 'fileContainer');
        var title = document.createElement('h3');
        title.classList.add('label');
        title.innerText = files[i];

        if (isImage(files[i])) {
            if (largeThumbs) {
                container.setAttribute('class', 'fileContainer2');
            }

            var newImg = document.createElement('img');
            newImg.setAttribute('alt', files[i]);
            newImg.setAttribute('loading', 'lazy');
            //var path = document.getElementById('directory').innerText + '\\';
            var path = current_directory + '\\';
            path += files[i];
            var item = new Explorer_Item(path, container);
            items.push(item);
            newImg.setAttribute('src', path);
            if (hover_zoom) {
                newImg.setAttribute('class', 'zoom-hover');
            }

            newImg.classList.add('thumbnail');
            newImg.setAttribute('onclick', 'onClick(this)');
            container.appendChild(newImg);
            item.setImage(newImg);
        }
        else if (isVideo(files[i])) {
            var container = document.createElement('div');
            container.setAttribute('class', 'video-container');
            var newVid = document.createElement('video');
            var title = document.createElement('h4');
            title.classList.add('label');
            title.innerText = files[i];
            var path = document.getElementById('textBox1').value + '\\';
            path += files[i];
            newVid.src = path;
            var item = new Explorer_Item(path, container);
            items.push(item);
            newVid.setAttribute('controls', 'controls');
            newVid.onfullscreenchange = () => {
                fullscreen = !fullscreen;
                console.log(fullscreen);
            };
            container.appendChild(newVid);
            container.appendChild(title);
            item.setImage(newVid);
        }
        else {
            var path = document.getElementById('textBox1').value + '\\';
            var fullPath = path + saved_files[i];
            var item = new Explorer_Item(fullPath, container);
            items.push(item);
            var icon = document.createElement('img');
            icon.setAttribute('alt', files[i]);
            icon.setAttribute('src', '../resources/file.jpg');

            /* Removed zoom from file icon
            if (hover_zoom) {
                icon.setAttribute('class', 'zoom-hover');
            }
            */

            icon.classList.add('icon');
            container.setAttribute('onclick', "selectElement(this)");

            //double click file to open
            icon.ondblclick = () => {
                var path = document.getElementById('textBox1').value + '\\';
                var fullPath = path + saved_files[i];
                console.log(i);
                console.log(path);
                console.log(saved_files[i]);
                console.log(saved_files);
                openFile(fullPath);
            };

            /*
            icon.onclick = (event) =>{
                console.log("onclick this: " + event.target);
                event.target.classList += 'selected';
            };
            */


            //icon.setAttribute('onclick', clickFunction);
            container.appendChild(icon);
            item.setImage(icon);
        }
        container.appendChild(title);
        content.appendChild(container);
    }
    if (autoPreview) previewAll();
});

ipcRenderer.on('copy', e => {
    copyClipboard = rightClickedElement.getAttribute('data-path');
    addToastToQueue(`Copied ${copyClipboard}`);
});

ipcRenderer.on('paste', e => {
    console.log(`Copying ${path.basename(copyClipboard)} to ${current_directory}`);
    fs.copyFile(copyClipboard, path.join(current_directory, path.basename(copyClipboard)), err => {
        if (err)
            console.log(err);
        else
            refresh();
    });
});

ipcRenderer.on('getInfo', (e) => {
    console.log("getInfo:");
    console.log(rightClickedElement);
    if (!rightClickedElement)
        return;
    let path = rightClickedElement.getAttribute('data-path');
    if (path != null) {
        let stats = fs.statSync(path);
        displayStats(stats);
    }
    else {
        console.log("Path not found");
    }

});

ipcRenderer.on('Home', () => {
    ipcRenderer.send('Start');
});

ipcRenderer.on('toast', (e, message) => {
    addToastToQueue(message);
});

ipcRenderer.on('rename', e => {
    let path = rightClickedElement.getAttribute('data-path');
    fs.renameSync(path, path + "rename");
    refresh();
});

ipcRenderer.on('delete', e => {
    let path = rightClickedElement.getAttribute('data-path');
    if (path != null) {
        let success = shell.moveItemToTrash(path);
        if (success) {
            console.log("Moved " + path + " to the trash");
            addToastToQueue(path + " removed");
            rightClickedElement.parentNode.removeChild(rightClickedElement);

        }
        else
            console.log("Error: file could not be deleted");
    }
});

ipcRenderer.on('directories', (e, directories) => {
    console.log("Received directories: " + directories);
    var content = document.getElementById("content");
    saved_directories = [...directories];
    for (let j = 0; j < saved_directories.length; j++) {
        saved_directories[j] = current_directory + '/' + saved_directories[j];
    }

    for (let i = 0; i < directories.length; i++) {
        var container = document.createElement('div');
        var icon = document.createElement('img');
        var fullPath = path.join(current_directory, directories[i]);
        var item = new Explorer_Item(fullPath, container);
        items.push(item);
        icon.setAttribute('src', '../resources/folder.png');

        /* Removed zoom from folder icon
        if (hover_zoom) {
            icon.setAttribute('class', 'zoom-hover');
        }
        */

        icon.classList.add('icon');
        container.appendChild(icon);
        container.setAttribute('class', 'fileContainer');
        var title = document.createElement('h3');
        title.classList.add('label');
        title.innerText = directories[i];
        container.appendChild(title);
        item.setImage(icon);

        container.onclick = (e) => {
            ipcRenderer.send('getDirectory', saved_directories[i]);
        };

        content.appendChild(container);
    }
});


ipcRenderer.on('directoryName', (e, name) => {
    dir_stack.push(name);
    current_directory = name;
    var pathBox = document.getElementById('textBox1');
    var fixed = name.replace('//', '/');
    pathBox.value = fixed;
    console.log("Directory changed to " + current_directory);
    updateDir();
});

ipcRenderer.on("Clear", (e) => {
    clearContent();
});

//handle the directory name and place it in textbox
ipcRenderer.on('dirName', function (e, dirName) {
    var textBox = document.getElementById('textBox1');
    textBox.setAttribute('value', dirName);
    updateDir();
});

//handle the selected image path and show it in modal
ipcRenderer.on('image', function (e, imagePath) {
    document.getElementById("img01").src = imagePath;
    document.getElementById("myModal").style.display = "block";
    updateDir();
});

ipcRenderer.on('openFileLocationRequest', (event) => {
    console.log("Open file location request received");
    ipcRenderer.send('openFileLocation', selectedTargetPath);
});