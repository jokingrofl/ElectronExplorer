//class to handle files and directories
//fields: path ---full path to file or directory
//isDirectory -- returns true if item is directory
//element -- html element corresponding to item
class Explorer_Item{
    constructor(item_path, element){
        this.path = item_path;
        var stats = fs.statSync(item_path);
        this.isDirectory = stats.isDirectory();
        this.element = element;
        this.imageAppended = false;
    }

    //set hover listener for getting preview image for directories
    setImage(element){
        this.image = element;
        if(this.isDirectory){
            this.image.onmouseenter = e =>{
                if (!this.imageAppended){
                    hoveredElement = element;
                    ipcRenderer.send('getFirstImage', this.path);
                    this.imageAppended = true;
                }
            
            };
        }
    }
}