base_url="http://127.0.0.1:5000/"


//切换注册和登录
function convert_log(event){
    console.log(event)
    event.target.classList.add("active")
    var cnt = document.getElementsByClassName("content")[0]
    console.log(cnt.classList)
    if(event.target.id==="login"){
        document.getElementById("signup").classList.remove("active")
        cnt.classList.remove('signup')
        cnt.classList.add('login')

    }
    else if(event.target.id==="signup"){
        document.getElementById("login").classList.remove("active")
        cnt.classList.remove('login')
        cnt.classList.add('signup')
    }
}

//输入验证信息部分
function typeinfo(event){
    event.target.parentNode.classList.add('focus')
}

function endtypeinfo(event){
    event.target.parentNode.classList.remove('focus')
}

// 
function login(event){
    event.preventDefault();
    console.log("login and signup")
    var pnl = document.getElementsByClassName("content")[0]
    if(pnl.classList.contains("signup")){
        let register_items = document.getElementsByClassName("white_font")
        console.log(register_items)
        if(register_items[2].value!==register_items[3].value){
            alert("repeat password wrong!");
            return 
        }
        else if(register_items[0].value==null||register_items[1]==null||register_items[2]==null)
        {
            alert("resigter item empty")
            return 
        }

        let register_info={
            "mailbox":register_items[0].value,
            "username":register_items[1].value,
            "password":register_items[2].value
        }
        console.log(register_info)
        let xhr=postAjax('signup',register_info)
        console.log(xhr)
        xhr.onreadystatechange=function(){
            if(xhr.status===200 && xhr.readyState===4){
                let response =JSON.parse(xhr.responseText)
                let data=response.data
                console.log(response.code)
                if(response.feedback==="success"){
                    alert("register successfully !")
                }
            }
        }
    }
    else if(pnl.classList.contains('login')){
        let login_info = {
            "username":document.getElementById("username").value,
            "password":document.getElementById("password").value
        }
        let xhr=postAjax('login',login_info)
        console.log(xhr)
        xhr.onreadystatechange = function(){
            if(xhr.status === 200 && xhr.readyState===4){
                let response = JSON.parse(xhr.responseText)
                console.log(response)
                if(response['feedback']==="success"){
                    alert("Log in successfully!")
                    console.log(response['token'])
                    setCookie('token', response['token'])
                    console.log('token:',document.cookie)
                    console.log('document.cookie:',getCookie('token'))
                    window.location.href="store.html"
                }
                else{
                    alert("username or password wrong!")
                }
            }
        }
    }

}

window.onload=function(){
    document.getElementById("login").onclick = convert_log
    document.getElementById("signup").onclick = convert_log

    console.log("login_button",document.getElementById("login_button"))
    document.getElementById("login_button").onclick=login

    inputs = document.getElementsByClassName("input")
    for(var bar in inputs){
        input_bar=inputs[bar]
        if(input_bar.firstElementChild){
            input_bar.firstElementChild.onfocus=typeinfo
            input_bar.firstElementChild.onblur=endtypeinfo
        }
    }
 }