export const authenticate=(response,next)=>{
    if(window !== undefined){
        sessionStorage.setItem("cwu_token",JSON.stringify(response.token));
        sessionStorage.setItem("cwu_id",JSON.stringify(response.id));
        sessionStorage.setItem("cwu_user",JSON.stringify(response.name));
        sessionStorage.setItem("cwu_email",JSON.stringify(response.email));
        sessionStorage.setItem("cwu_to_email",JSON.stringify(response.email));
        sessionStorage.setItem("cwu_permission",JSON.stringify(response.permission));
    }
    else{
        if(!sessionStorage.getItem("cwu_token")){
            sessionStorage.setItem("cwu_token",JSON.stringify(response.token));
            sessionStorage.setItem("cwu_id",JSON.stringify(response.id));
            sessionStorage.setItem("cwu_user",JSON.stringify(response.name));
            sessionStorage.setItem("cwu_email",JSON.stringify(response.email));
            sessionStorage.setItem("cwu_to_email",JSON.stringify(response.email));
            sessionStorage.setItem("cwu_permission",JSON.stringify(response.permission));
        }
    }
    next();
}

//get token data
export const getToken=()=>{
    if(window !== undefined){
        if(sessionStorage.getItem("cwu_token")){
            return JSON.parse(sessionStorage.getItem("cwu_token"));
        }else{
            return false;
        }
    }
}

//get user data
export const getUserName=()=>{
    if(window !== undefined){
        if(sessionStorage.getItem("cwu_user")){
            return JSON.parse(sessionStorage.getItem("cwu_user"));
        }else{
            return false;
        }
    }
}

export const getUserEmail=()=>{
    if(window !== undefined){
        if(sessionStorage.getItem("cwu_email")){
            return JSON.parse(sessionStorage.getItem("cwu_email"));
        }else{
            return false;
        }
    }
}

//get id data
export const getUserID=()=>{
    if(window !== undefined){
        if(sessionStorage.getItem("cwu_id")){
            return JSON.parse(sessionStorage.getItem("cwu_id"));
        }else{
            return false;
        }
    }
}

export const getPermission=()=>{
    if(window !== undefined){
        if(sessionStorage.getItem("cwu_permission")){
            return JSON.parse(sessionStorage.getItem("cwu_permission"));
        }else{
            return false;
        }
    }
}


export const logout=(next)=>{
    if(window !== undefined){
        sessionStorage.removeItem("cwu_token");
        sessionStorage.removeItem("cwu_user");
        sessionStorage.removeItem("cwu_email");
        sessionStorage.removeItem("cwu_id");
        sessionStorage.removeItem("cwu_permission");
        sessionStorage.removeItem("cwu_to_email");
    }
    next();
}