var showingPic = 0;

//param array of img elements
//TODO: change to take in an item object with array for preview images, add internal count to item class
//to keep track of which pic is shown
togglePic(array){
    for (let i = 0; i < array.length; i++){
        if (i === showingPic){
            array[i].style.display = "block";
        }
        else{
            array[i].style.display = "none";
        }
    }
    showingPic++;
    showingPic %= array.length;
}