function display_purchased_songs(target) {
    let order = target.parentNode;
    let order_items = order.getElementsByClassName("song-order-items")[0];
    console.log(order_items);


    if (order_items.classList.contains('nodisplay') == true) {
        order_items.classList.remove('nodisplay');
        order_items.classList.add('yesdisplay');
    } else {
        order_items.classList.remove('yesdisplay');
        order_items.classList.add('nodisplay');
    }

}

function upload_order() {
    if (getCookie('token')) {
        let xhr = postAjax('upload_order', {})
        xhr.onreadystatechange = function () {
            if (xhr.status === 200 && xhr.readyState === 4) {
                let response = JSON.parse(xhr.responseText)
                if (response['feedback'] === 'success') {
                    console.log("upload orders successfully")
                    let order_start_head = document.getElementById("order_start_head")
                    let data = response['data']
                    for (let i = 0; i < data.length; i++) {
                        console.log("order item:", data[i])
                        let one_order = document.createElement("div")
                        one_order.className = "tour-row accordion"
                        //订单基础信息

                        let order_song_html = document.createElement("div")
                        order_song_html.className = "song-order-items nodisplay"
                        let sum_price =0
                        for (let j = 0; j < data[i]['cart'].length; j++) {
                            let order_song = data[i]['cart'][j]
                            let one_order_song = document.createElement("span")
                            one_order_song.innerHTML =
                                `<strong class="tour-item tour-song"></strong>
                        <span class="tour-item tour-piece-arena">${order_song['Name']}</span>
                        <span class="tour-item tour-piece-status">${order_song['Singer']}</span>
                        <span class="tour-item tour-piece-price">$ ${order_song['Price']}</span>`
                            order_song_html.appendChild(one_order_song)
                            sum_price+=order_song['Price']
                        }
                        one_order.innerHTML =
                            `<strong class="tour-item tour-date">${new Date(data[i]['time']*1000).toLocaleDateString()}</strong>
                            <span class="tour-item tour-arena">${data[i]['_id']}</span>
                            <span class="tour-item tour-status">Completed</span>
                            <span class="tour-item tour-price">$ ${sum_price}</span>
                            <button type="button" class="tour-item tour-btn btn-primary" onclick="display_purchased_songs(this)">VIEW</button>`
                        one_order.appendChild(order_song_html)
                        order_start_head.appendChild(one_order)
                    }

                } else {
                    alert("Login timeout")
                    window.location.href = "login.html"
                }
            }

        }

        //let order_start_head = document.getElementById("order_start_head")
        //let insertElemnt = document.createElement("div")
        //insertElemnt.classList.add()
    } else {
        alert("Not login")
        window.location.href = "login.html"

    }
}


window.onload = function () {
    upload_order()

    song_display_btns = document.getElementsByClassName("tour-item tour-btn btn-primary")
    for (var i = 0; i < song_display_btns.length; i++) {
        song_display_btns[i].onclick = display_purchased_songs
    }
}