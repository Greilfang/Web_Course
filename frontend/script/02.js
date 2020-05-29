function show_detail(target) {
    let cookie = getCookie('token')
    console.log(cookie)
    if (cookie) {
        let song_name = target.parentElement.parentElement.getElementsByClassName('shop-item-title')[0].innerHTML
        console.log("song_name", song_name)

        let xhr = postAjax('load_detail', {'song_name': song_name})
        xhr.onreadystatechange = function () {
            if (xhr.status === 200 && xhr.readyState === 4) {
                let response = JSON.parse(xhr.responseText)
                if (response['feedback'] === 'success') {
                    let data = response['data']
                    document.getElementById("song_img").src = data['Image']
                    document.getElementById("song_singer_name").innerHTML =
                        `${data['Name']}<br>` + `<span id="singer_name">${data['Singer']}</span>`
                    document.getElementById("about_song").innerHTML = data["About"]
                    document.getElementById("song_price").innerHTML = `$ ${data['Price']}`
                    let card = document.getElementById("central-detail-card")
                    card.classList.remove("nopresent")
                    card.classList.add("present")
                } else {
                    alert("login timeout");
                    window.location.href = "login.html";
                }
            }
        }
    } else {
        alert("not login")
        window.location.href = "login.html"
    }
}
function conceal_detail(){
    let card=document.getElementById("central-detail-card")
    card.classList.remove("present")
    card.classList.add("nopresent")
}

function add_to_cart() {
    let cookie=getCookie('token')
    if(cookie){
        let img_url = document.getElementById("song_img").src
        console.log('song_name:',document.getElementById("song_singer_name").childNodes[0].textContent)
        let song_name = document.getElementById("song_singer_name").childNodes[0].textContent
        let song_price = Number(document.getElementById("song_price").innerHTML.split(" ")[1])
        let song_quantity = 1
        console.log("singer_name:",document.getElementById("singer_name"))
        let singer_name = document.getElementById("singer_name").innerHTML
        let cart_item = {
            'Image':img_url,
            'Name':song_name,
            'Singer':singer_name,
            'Price':song_price,
            'Quantity':song_quantity
        }
        let xhr = postAjax('update_cart',cart_item)
        xhr.onreadystatechange = function () {
            if(xhr.status===200 && xhr.readyState===4){
                let response = JSON.parse(xhr.responseText)
                if(response['feedback']==='success') {
                    alert("Add to cart successfully")
                }else{
                    alert("Login timeout")
                }
            }
        }
    }
    else{
        alert("Not login")
        window.location.href="login.html"
    }

}



function initialize_songs() {
    var xhr = postAjax('initialize', {})
    console.log(xhr)
    xhr.onreadystatechange = function () {
        if (xhr.status === 200 && xhr.readyState === 4) {
            var response = JSON.parse(xhr.responseText)
            console.log(response)
            if (response['feedback'] === "success") {
                let song_section = document.getElementById("song_section");
                for (let i = 0; i < response['data'].length; i++) {
                    let insertElement = document.createElement("div");
                    insertElement.className = "shop-item";
                    insertElement.innerHTML =
                        `<span class="shop-item-title">${response['data'][i]['Name']}</span>` +
                        `<div class="shop-item-image">` +
                        `<img src="${response['data'][i]['Image']}" width="200">` +
                        '</div>' +
                        `<div class="shop-item-details">` +
                        `<span class="shop-item-price">$ ${response['data'][i]['Price']}</span>` +
                        '<button class="btn btn-primary" type="button" onclick="show_detail(this)">VIEW</button>' +
                        '</div>';


                    song_section.appendChild(insertElement);
                    // let btn =song_section.getElementsByClassName("btn btn-primary")[0]
                    // console.log('btn',btn)
                    // btn.addEventListener('onclick',show_detail())
                }
            } else {
                alert("initialize_songs_wrong")
            }
        }
    }

}




window.onload = function(){
    initialize_songs()


    // mores=document.getElementsByClassName("btn-primary")
    // for(var i =0;i<mores.length;i++){
    //     mores[i].onclick = show_detail
    // }
    let close_icon = document.getElementById("close-icon")
    close_icon.onclick=conceal_detail
    let like_btn =document.getElementById("like_button")
    like_btn.onclick = add_to_cart
}
