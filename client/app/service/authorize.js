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
            try {
                return JSON.parse(sessionStorage.getItem("cwu_token"));
            } catch (error) {
                logout();
            }
        }else{
            return false;
        }
    }
}

//get user data
export const getUserName=()=>{
    if(window !== undefined){
        if(sessionStorage.getItem("cwu_user")){
            try {
                return JSON.parse(sessionStorage.getItem("cwu_user"));
            } catch (error) {
                logout();
            }
        }else{
            return false;
        }
    }
}

export const getUserEmail=()=>{
    if(window !== undefined){
        if(sessionStorage.getItem("cwu_email")){
            try {
                return JSON.parse(sessionStorage.getItem("cwu_email"));
            } catch (error) {
                logout();
            }
        }else{
            return false;
        }
    }
}

//get id data
export const getUserID=()=>{
    if(window !== undefined){
        if(sessionStorage.getItem("cwu_id")){
            try {
                return JSON.parse(sessionStorage.getItem("cwu_id"));
            } catch (error) {
                logout();
            }
        }else{
            return false;
        }
    }
}

export const getPermission=()=>{
    if(window !== undefined){
        if(sessionStorage.getItem("cwu_permission")){
            try {
                return JSON.parse(sessionStorage.getItem("cwu_permission"));
            } catch (error) {
                logout();
            }
        }else{
            return false;
        }
    }
}

export const setEmail=(name)=>{
    if(window !== undefined){
        if(sessionStorage.getItem("cwu_email")){
            try {
                return sessionStorage.setItem("cwu_email",JSON.stringify(name));
            } catch (error) {
                logout();
            }
        }else{
            return false;
        }
    }
}

export const setName=(email)=>{
    if(window !== undefined){
        if(sessionStorage.getItem("cwu_user")){
            try {
                return sessionStorage.setItem("cwu_user",JSON.stringify(email));
            } catch (error) {
                logout();
            }
        }else{
            return false;
        }
    }
}

export const logout=()=>{
    if(window !== undefined){
        sessionStorage.removeItem("cwu_token");
        sessionStorage.removeItem("cwu_user");
        sessionStorage.removeItem("cwu_email");
        sessionStorage.removeItem("cwu_id");
        sessionStorage.removeItem("cwu_permission");
        sessionStorage.removeItem("cwu_to_email");
    }
}