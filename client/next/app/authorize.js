export const authenticate=(response,next)=>{
    if(window !== "undefined"){
        // collect data to session storage
        sessionStorage.setItem("token",JSON.stringify(response.data.token));
        sessionStorage.setItem("user",JSON.stringify(response.data.username));
    }
    next();
}

//get token data
export const getToken=()=>{
    if(window !== "undefined"){
        if(sessionStorage.getItem("token")){
            return JSON.parse(sessionStorage.getItem("token"));
        }else{
            return false;
        }
    }
}

//get use data
export const getUser=()=>{
    if(window !== "undefined"){
        if(sessionStorage.getItem("user")){
            return JSON.parse(sessionStorage.getItem("user"));
        }else{
            return false;
        }
    }
}

export const logout=(next)=>{
    if(window !== "undefined"){
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
    }
    next();
}