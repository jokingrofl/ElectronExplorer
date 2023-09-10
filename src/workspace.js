//class to represent the currently opened folder, items to be of type explorer_item
class Workspace {
    //element = HTML element containing explorer items
    constructor(element){
        this.selectedItems = [];
        this.displayedItems = [];
        this.element = element;
        this.element.onclick = e => {
            console.log("Clicked blank space");
            this.clearSelection();
        };
    }

    setItems(items){
        this.displayedItems = items;
    }

    selectItem(item){
        this.selectedItems.push(item);
        item.setToSelected();
    }

    clearSelection(){
        for(let item of this.selectedItems)
            item.deselect();
        this.selectedItems = [];
    }

    getSelectedItems(){
        let paths = [];
        for(let item of this.selectedItems)
            paths.push(item.path);
        return paths;
    }


}