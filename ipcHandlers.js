const fs = require('fs');
const path = require('path');
const Queue = require('./queue.js');
var items = [];
const actionsQ = new Queue();

ipcRenderer.on('alert', (e, message) => {
    customAlert(message);
});

//handle response from main app
ipcRenderer.on('files', function(e, files){
    var content = document.getElementById("content");
    saved_files = [...files];
    for(let i = 0; i < files.length; i++){
        var container = document.createElement('div');
        container.setAttribute('class', 'fileContainer');
        var title = document.createElement('h3');
        title.classList.add('label');
        title.innerText = files[i];
        
        if (isImage(files[i])){
            if (largeThumbs){
                container.setAttribute('class', 'fileContainer2');
            }

            var newImg = document.createElement('img');
            newImg.setAttribute('alt', files[i]);
            var path = document.getElementById('directory').innerText + '\\';
            path += files[i];
            var item = new Explorer_Item(path, container);
            items.push(item);
            newImg.setAttribute('src', path);
            if (hover_zoom){
                newImg.setAttribute('class', 'zoom-hover');
            }
            
            newImg.classList.add('thumbnail');
            newImg.setAttribute('onclick', 'onClick(this)');
            container.appendChild(newImg);
            item.setImage(newImg);
        }
        else if(isVideo(files[i])){
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
            newVid.onfullscreenchange = () =>{
                fullscreen = !fullscreen;
                console.log(fullscreen);
            };
            container.appendChild(newVid);
            container.appendChild(title);
            item.setImage(newVid);
        }
        else{
            var path = document.getElementById('textBox1').value + '\\';
            var fullPath = path + saved_files[i];
            var item = new Explorer_Item(fullPath, container);
            items.push(item);
            var icon = document.createElement('img');
            icon.setAttribute('alt', files[i]);
            icon.setAttribute('src', 'file.jpg');
            if (hover_zoom){
                icon.setAttribute('class', 'zoom-hover');
            }
            
            icon.classList.add('icon');
            container.setAttribute('onclick', "selectElement(this)");

            //double click file to open
            icon.ondblclick = () =>{
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
});

ipcRenderer.on('getInfo', (e) => {
    console.log("getInfo:");
    console.log(rightClickedElement);
    if (!rightClickedElement)
        return;
    let path = rightClickedElement.getAttribute('data-path');
    if (path != null){
        let stats = fs.statSync(path);
        displayStats(stats);
    } 
    else{
        console.log("Path not found");
    }

});

ipcRenderer.on('toast', (e, message) => {
    actionsQ.push(customToast, message);
    if(!actionsQ.isRunning){
        actionsQ.start();
    }
});

ipcRenderer.on('delete', e => {
    let path = rightClickedElement.getAttribute('data-path');
    if (path != null){
        let success = shell.moveItemToTrash(path);
        if (success){
            console.log("Moved " + path + " to the trash");
            ipcRenderer.send('toast', path + " removed");
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
    for (let j = 0; j < saved_directories.length; j++){
        saved_directories[j] = current_directory + '/' + saved_directories[j];
    }

    for (let i = 0; i < directories.length; i++){
        var container = document.createElement('div');
        var icon = document.createElement('img');
        var fullPath = path.join(current_directory, directories[i]);
        var item = new Explorer_Item(fullPath, container);
        items.push(item);
        icon.setAttribute('src', 'folder.png');
        if (hover_zoom){
            icon.setAttribute('class', 'zoom-hover');
        }
        
        icon.classList.add('icon');
        container.appendChild(icon);
        container.setAttribute('class', 'fileContainer');
        var title = document.createElement('h3');
        title.classList.add('label');
        title.innerText = directories[i];
        container.appendChild(title);
        item.setImage(icon);

        container.onclick = (e) =>{
            ipcRenderer.send('getDirectory', saved_directories[i]);
        };
        
        content.appendChild(container);
    }
});


ipcRenderer.on('directoryName', (e, name) => {
    dir_stack.push(name);
    current_directory = name;
    var pathBox = document.getElementById('textBox1');
    var text = document.getElementById('directory');
    var fixed = name.replace('//', '/');
    text.innerText = fixed;
    pathBox.setAttribute('value', fixed);
    console.log("Directory changed to " + current_directory);
    updateDir();
});

ipcRenderer.on("Clear", (e) =>{
    clearContent();
});

//handle the directory name and place it in textbox
ipcRenderer.on('dirName', function(e, dirName){
    var textBox = document.getElementById('textBox1');
    textBox.setAttribute('value', dirName);
    updateDir();
});

//handle the selected image path and show it in modal
ipcRenderer.on('image', function(e, imagePath){
    document.getElementById("img01").src = imagePath;
    document.getElementById("myModal").style.display = "block";
    updateDir();
});

//handling the first image result from main
ipcRenderer.on('firstImage', (e, imagePath) => {
    var firstImage = document.createElement('img');
    var content = document.getElementById("content");
    firstImage.classList.add('thumbnail');
    firstImage.setAttribute('src', imagePath);
    firstImage.classList.add('preview');
    console.log(hoveredElement);
    console.log(firstImage);
    //content.appendChild(firstImage);
    //hoveredElement.parentNode.appendChild(firstImage);
    var icon = document.createElement('img');
    icon.setAttribute('src', 'openFolder.svg');
    icon.classList.add('corner-icon');
    hoveredElement.parentNode.appendChild(icon);
    hoveredElement.parentNode.replaceChild(firstImage, hoveredElement);

    //hoveredElement.appendChild(firstImage);
});