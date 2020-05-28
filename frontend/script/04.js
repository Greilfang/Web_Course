function display_purchased_songs(target) {
    let order = target.parentNode;
    let order_items = order.getElementsByClassName("song-order-items")[0];
    console.log(order_items);


    if (order_items.classList.contains('nodisplay') == true) {
        order_items.classList.remove('nodisplay');
        order_items.classList.add('yesdisplay');
    }
    else {
        order_items.classList.remove('yesdisplay');
        order_items.classList.add('nodisplay');
    }

}
function upload_order(){
    let order_start_head = document.getElementById("order_start_head")
    let insertElemnt = document.createElement("div")
    insertElemnt.classList.add()
}



window.onload=function(){
    upload_order()

    song_display_btns=document.getElementsByClassName("tour-item tour-btn btn-primary")
    for(var i =0;i<song_display_btns.length;i++){
        song_display_btns[i].onclick=display_purchased_songs
    }
}