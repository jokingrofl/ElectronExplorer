//class to handle files and directories
//fields: path ---full path to file or directory
//isDirectory -- returns true if item is directory
//element -- html element corresponding to item
class Explorer_Item {
    constructor(item_path, element) {
        this.path = item_path;
        var stats = fs.statSync(item_path);
        this.isDirectory = stats.isDirectory();
        this.element = element;
        this.imageAppended = false;
        this.element.draggable = true;
        this.element.setAttribute('data-path', item_path);
    }

    /** set hover listener for getting preview image for directories */
    setImage(element) {
        this.image = element;

        function getSrc(element) {
            if (!element.getAttribute('data-path'))
                return element.querySelector('img').getAttribute('data-path');
            else
                return element.getAttribute('data-path');
        }

        function getPath(element) {
            if (!element.getAttribute('data-path'))
                return element.parentNode.getAttribute('data-path');
            else
                return element.getAttribute('data-path');
        }

        function dragStart(e) {
            e.dataTransfer.setData("text", getPath(e.target));
        }

        function drop(e) {
            console.log("Ondrop activated");
            console.log(e);
            console.log(e.dataTransfer.getData("text"));
            console.log(getPath(e.target));
            let targetFolder = getPath(e.target);
            let file = path.basename(e.dataTransfer.getData('text'));
            fs.rename(formatPath(e.dataTransfer.getData('text')), path.join(targetFolder, file), e => {
                if (e)
                    console.log(e);
                else{
                    console.log(`File moved`);
                    //refresh();
                }
                    
            });
        }

        if (this.isDirectory) {
            this.image.onmouseenter = e => {
                hoveredElement = this.image;
                this.appendImage();
            };

            this.element.ondrop = drop;
            this.element.ondragstart = dragStart;
            this.image.ondragstart = dragStart;
        }
    }

    /**Show image preview for folder */
    appendImage() {
        let firstImgSrc = null;
        if (!this.imageAppended) {
            try {
                var files = fs.readdirSync(this.path);
                var filtered = files.filter((value, index, arr) => {
                    return isImage(value);
                });
                if (filtered.length > 0) {
                    firstImgSrc = path.join(this.path, filtered[0]);
                }
                else
                    console.log("Found no images in path: " + this.path);
            }
            catch (exception) {
                console.log("Error getting information on " + this.path);
                console.log(exception);
            }
        }

        if (firstImgSrc === null) return;

        var firstImage = document.createElement('img');
        var content = document.getElementById("content");
        firstImage.classList.add('thumbnail');
        firstImage.setAttribute('src', firstImgSrc);
        firstImage.classList.add('preview');
        var icon = document.createElement('img');
        icon.setAttribute('src', '../resources/openFolder.svg');
        icon.classList.add('corner-icon');
        this.image.parentNode.appendChild(icon);
        this.image.parentNode.replaceChild(firstImage, this.image);


        this.imageAppended = true;
    }
}