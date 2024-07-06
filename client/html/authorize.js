function authenticate(response)
{
    if(window !== undefined){
        // collect data to session storage
        sessionStorage.setItem("cwu_token",JSON.stringify(response.token));
        sessionStorage.setItem("cwu_id",JSON.stringify(response.id));
        sessionStorage.setItem("cwu_user",JSON.stringify(response.name));
        sessionStorage.setItem("cwu_email",JSON.stringify(response.email));
        sessionStorage.setItem("cwu_permission",JSON.stringify(response.permission));
        // console.log(sessionStorage)
        return "registered";
    }
    else{
        if(sessionStorage.getItem("cwu_token")){
            return "registered";
        }else{
            sessionStorage.setItem("cwu_token",JSON.stringify(response.token));
            sessionStorage.setItem("cwu_id",JSON.stringify(response.id));
            sessionStorage.setItem("cwu_user",JSON.stringify(response.name));
            sessionStorage.setItem("cwu_email",JSON.stringify(response.email));
            sessionStorage.setItem("cwu_permission",JSON.stringify(response.permission));
            return "registered";
        }
    }
}

//get token data
function getToken()
{
    if(window !== undefined){
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
    if(window !== undefined){
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
    if(window !== undefined){
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
    if(window !== undefined){
        if(sessionStorage.getItem("cwu_id")){
            return JSON.parse(sessionStorage.getItem("cwu_id"));
        }else{
            return false;
        }
    }
}

//get permission data
function  getPermission()
{
    if(window !== undefined){
        if(sessionStorage.getItem("cwu_permission")){
            return JSON.parse(sessionStorage.getItem("cwu_permission"));
        }else{
            return false;
        }
    }
}

function logout()
{
    if(window !== undefined){
        sessionStorage.removeItem("cwu_token");
        sessionStorage.removeItem("cwu_user");
        sessionStorage.removeItem("cwu_email");
        sessionStorage.removeItem("cwu_id");
        sessionStorage.removeItem("cwu_permission");
        return true;
    }else{
        return false;
    }
}