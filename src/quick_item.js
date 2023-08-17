class Quick_Item {
    constructor(path) {
        this.path = path;
        let paths = parsePath(this.path);
        this.name = paths[paths.length - 1];
        let sidebar = document.getElementById("quickList");
        let newQuick = document.createElement("span");
        this.element = newQuick;
        this.element.innerText = this.name;
        this.element.classList.add("quickLink");
        this.row = document.createElement("div");
        this.row.classList.add("row");
        this.element.onclick = e => {
            document.getElementById("textBox1").value = this.path;
            goToDir(this.path);
            closeQuickList();
        };
        let closeBtn = document.createElement("span");
        let closeContainer = document.createElement("div");
        closeContainer.classList.add("closeContainer");
        closeBtn.innerText = "x";
        closeBtn.classList.add("quickLinkClose");
        closeBtn.onclick = e => {
            closeContainer.removeChild(closeBtn);
            this.row.removeChild(closeContainer);
            this.row.removeChild(this.element);
            sidebar.removeChild(this.row);
            quickList.splice(quickList.indexOf(this), 1);
            writeQuickFile();
            log(quickList);
        };
        this.row.appendChild(this.element);
        closeContainer.appendChild(closeBtn);
        this.row.appendChild(closeContainer);
        sidebar.appendChild(this.row);
        console.log(`New quick item created`);
        console.log(this);
    }


}