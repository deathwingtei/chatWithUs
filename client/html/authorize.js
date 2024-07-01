function authenticate(response,next)
{
    if(window !== "undefined"){
        // collect data to session storage
        sessionStorage.setItem("cwu_token",JSON.stringify(response.data.result.token));
        sessionStorage.setItem("cwu_id",JSON.stringify(response.data.result.id));
        sessionStorage.setItem("cwu_user",JSON.stringify(response.data.result.name));
        sessionStorage.setItem("cwu_email",JSON.stringify(response.data.result.email));
        // console.log(sessionStorage)
    }
    next();
}

//get token data
function getToken()
{
    if(window !== "undefined"){
        if(sessionStorage.getItem("cwu_token")){
            return JSON.parse(sessionStorage.getItem("cwu_token"));
        }else{
            return false;
        }
    }
}

//get name data
function getUserName()
{
    if(window !== "undefined"){
        if(sessionStorage.getItem("cwu_user")){
            return JSON.parse(sessionStorage.getItem("cwu_user"));
        }else{
            return false;
        }
    }
}

//get email data
function getUserEmail()
{
    if(window !== "undefined"){
        if(sessionStorage.getItem("cwu_email")){
            return JSON.parse(sessionStorage.getItem("cwu_email"));
        }else{
            return false;
        }
    }
}

//get id data
function  getUserID()
{
    if(window !== "undefined"){
        if(sessionStorage.getItem("cwu_id")){
            return JSON.parse(sessionStorage.getItem("cwu_id"));
        }else{
            return false;
        }
    }
}

function logout(next)
{
    if(window !== "undefined"){
        sessionStorage.removeItem("cwu_token");
        sessionStorage.removeItem("cwu_user");
        sessionStorage.removeItem("cwu_email");
        sessionStorage.removeItem("cwu_id");
    }
    next();
}