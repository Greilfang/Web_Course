// function search(event){
//     e = event?event:(window.event?window.event:null)
//     if(e.keyCode==13){
//         keyword= document.getElementById("gover-search-key").value
//         if (keyword !==""){
//
//         }
//         //提交搜索请求
//         // console.log("检测到回车了",keyword)
//         // alert("检测到回车了",keyword)
//
//     }
// }
function submit_order(event) {
    if (getCookie('token')) {
        let xhr = postAjax('submit_order', {})
        xhr.onreadystatechange = function () {
            if (xhr.status === 200 && xhr.readyState === 4) {
                let response = JSON.parse(xhr.responseText)
                if (response['feedback'] === 'success') {
                    alert('purchase successfully')
                    document.getElementById("cart_items_head").innerHTML =
                        `<div class="cart-row">
                        <span class="cart-column cart-header cart-item ">ITEM</span>
                        <span class="cart-column cart-header cart-price ">PRICE</span>
                        <span class="cart-column cart-header cart-quantity ">QUANTITY</span>
                        </div>`
                } else {
                    alert("Login timeout")
                    window.location.href = "login.html"
                }

            }
        }
    } else {
        alert("Not login")
        window.location.href = "login.html"
    }
}




function remove_cart_item(target) {
    if (getCookie('token')) {
        let song_name = target.parentElement.parentElement.getElementsByClassName("cart-item-title")[0].innerHTML
        let xhr = postAjax('delete_cart_item', {"song": song_name})
        xhr.onreadystatechange = function () {
            if (xhr.status === 200 && xhr.readyState === 4) {
                let response = JSON.parse(xhr.responseText)
                if (response['feedback'] === 'success') {
                    console.log("delete car item successfully")
                    let original_price = document.getElementById("cart_total_price")
                    let num_item = target.parentElement.getElementsByClassName("cart-item-quantity")[0].value
                    let price = Number(target.parentElement.previousElementSibling.innerHTML.split(" ")[1])
                    original_price.innerHTML = (original_price.innerHTML - price * num_item).toFixed(2)
                    target.parentElement.parentElement.remove()
                } else {
                    alert("Login timeout")
                    window.location.href = "login.html"
                }
            }
        }
    } else {
        alert("Not login")
        window.location.href = "login.html"
    }
}


function load_cart() {
    let cookie = getCookie('token')
    if (cookie) {
        let xhr = postAjax('upload_cart', {})
        xhr.onreadystatechange = function () {
            if (xhr.status === 200 && xhr.readyState === 4) {
                let response = JSON.parse(xhr.responseText)
                if (response['feedback'] === 'success') {
                    console.log("upload user cart")
                    let data = response['data']
                    let cart_head = document.getElementById("cart_items_head")
                    let cart_total_price = 0;
                    for (let i = 0; i < data.length; i++) {
                        let insertElement = document.createElement("div");
                        insertElement.classList.add("cart-row");
                        insertElement.innerHTML =
                            `<div class="cart-column cart-item ">
                            <img class = "cart-item-image" src="${data[i]['Image']}" width="100">
                            <span class="cart-item-title">${data[i]['Name']}</span>
                            </div>
                            <span class="cart-column cart-price ">$ ${data[i]['Price']}</span>
                        <div class="cart-column cart-quantity ">
                            <input class="cart-item-quantity" type="number" value="${data[i]['Quantity']}">
                            <button class ="btn btn-danger" type="button" onclick="remove_cart_item(this)">REMOVE</button>
                            </div> `
                        cart_head.appendChild(insertElement)
                        cart_total_price += data[i]['Price'] * data[i]['Quantity']
                    }
                    document.getElementById("cart_total_price").innerHTML = cart_total_price


                } else {
                    alert("Login timeout")
                    window.location.href = "login.html"
                }
            }
        }
    } else {
        alert("Not login")
        window.location.href = "login.html"
    }
}



window.onload = function () {
    load_cart()
    document.getElementById("purchase_button").onclick=submit_order
    // document.getElementById("gover-search-key").onkeydown = search
    //
    // tasks = document.getElementsByClassName("task")
    // for(let i =0;i<tasks.length;i++){
    //     console.log(tasks[i].getElementsByTagName("label"))
    //     tasks[i].getElementsByTagName("label")[1].onclick = delete_like
    // }

}