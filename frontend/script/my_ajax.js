base_url = "http://127.0.0.1:5000/"
READY = 4;
SUCCESS = 200;

function setCookie(name,value)
{
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days*24*60*60*1000);
    document.cookie = name + "="+ escape (value) + ";expires=" + exp.toUTCString();
}

//读取cookies
function getCookie(name)
{
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
 
    if(arr=document.cookie.match(reg)){
        return unescape(arr[2]);
    }
    else
        return null;
}

//删除cookies
function delCookie(name)
{
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval=getCookie(name);
    if(cval!=null)
        document.cookie= name + "="+cval+";expires="+exp.toGMTString();
}

function postAjax(url,data){
    var xhr = new XMLHttpRequest();
    xhr.open("post",base_url+url);
    xhr.setRequestHeader('Conent-type',"application/json;charset-UTF-8");
    console.log("user token");
    //带上token传上去
    var token=getCookie("token")
    if (token){
        xhr.setRequestHeader("Authorization",token);
    }
    console.log("data:",data)
    xhr.send(JSON.stringify(data));
    return xhr;
}
