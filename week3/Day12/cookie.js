function setCookie(name, val, expireDate){
    let cookieStr = name + "=" + val +((expireDate ==null)?"":("; expires=" +expireDate.toUTCString()));
    Document.cookie = cookieStr;
}


// 저장된 값을 가져오는 함수
function getCookie(name){
    let str = name +"=";
    let pairs = document.cookie.split(";");
    for (let i =0; i<pairs.length; i++){
        let pair = pairs[i].trim();
        let unit =pair.split("=")
        if (unit[0]== name){
            return unit[i];
        }
    }
}