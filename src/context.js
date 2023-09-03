    let selectedTargetPath = null;
    //set up context menu depending on right clicked element
    document.addEventListener('contextmenu', (e) =>{
        rightClickedElement = e.target;
        console.log("addEventListener: ");
        console.log(e.target);
        console.log(e.target.tagName);
        rightClickedElement = getContainer(rightClickedElement);
        selectedTargetPath = rightClickedElement.getAttribute('data-path');
        if (e.target.tagName === "IMG"){
            remote.getGlobal('imgContextMenu').popup(remote.getCurrentWindow());
        }
        else{
            remote.getGlobal('genCM').popup(remote.getCurrentWindow());
        }
        
    
       });

       //get the container of explorer item
       function getContainer(element){
        //    console.log("getContainer:");
        //     console.log(element);
        //     console.log(element.parentElement);

           if(element.classList.contains('fileContainer'))
           return element;

           if(element.parentElement === null){
               return null;
           }

        if (element.parentElement.classList.contains('fileContainer')){
            return element.parentElement;
        }
        else{
            return getContainer(element.parentElement);
        }
       }