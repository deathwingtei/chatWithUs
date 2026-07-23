export interface AuthResponse {
  token: string;
  id: string;
  name: string;
  email: string;
  permission: string;
}

export const authenticate = (response: AuthResponse, next: () => void): void => {
    if (typeof window !== "undefined") {
        sessionStorage.setItem("cwu_token", JSON.stringify(response.token));
        sessionStorage.setItem("cwu_id", JSON.stringify(response.id));
        sessionStorage.setItem("cwu_user", JSON.stringify(response.name));
        sessionStorage.setItem("cwu_email", JSON.stringify(response.email));
        sessionStorage.setItem("cwu_to_email", JSON.stringify(response.email));
        sessionStorage.setItem("cwu_permission", JSON.stringify(response.permission));
    }
    next();
};

export const getToken = (): string | false => {
    if (typeof window !== "undefined") {
        const item = sessionStorage.getItem("cwu_token");
        if (item) {
            try {
                return JSON.parse(item);
            } catch (error) {
                logout();
                return false;
            }
        } else {
            return false;
        }
    }
    return false;
};

export const getUserName = (): string | false => {
    if (typeof window !== "undefined") {
        const item = sessionStorage.getItem("cwu_user");
        if (item) {
            try {
                return JSON.parse(item);
            } catch (error) {
                logout();
                return false;
            }
        } else {
            return false;
        }
    }
    return false;
};

export const getUserEmail = (): string | false => {
    if (typeof window !== "undefined") {
        const item = sessionStorage.getItem("cwu_email");
        if (item) {
            try {
                return JSON.parse(item);
            } catch (error) {
                logout();
                return false;
            }
        } else {
            return false;
        }
    }
    return false;
};

export const getUserID = (): string | false => {
    if (typeof window !== "undefined") {
        const item = sessionStorage.getItem("cwu_id");
        if (item) {
            try {
                return JSON.parse(item);
            } catch (error) {
                logout();
                return false;
            }
        } else {
            return false;
        }
    }
    return false;
};

export const getPermission = (): string | false => {
    if (typeof window !== "undefined") {
        const item = sessionStorage.getItem("cwu_permission");
        if (item) {
            try {
                return JSON.parse(item);
            } catch (error) {
                logout();
                return false;
            }
        } else {
            return false;
        }
    }
    return false;
};

export const setEmail = (email: string): void => {
    if (typeof window !== "undefined") {
        if (sessionStorage.getItem("cwu_email")) {
            try {
                sessionStorage.setItem("cwu_email", JSON.stringify(email));
            } catch (error) {
                logout();
            }
        }
    }
};

export const setName = (name: string): void => {
    if (typeof window !== "undefined") {
        if (sessionStorage.getItem("cwu_user")) {
            try {
                sessionStorage.setItem("cwu_user", JSON.stringify(name));
            } catch (error) {
                logout();
            }
        }
    }
};

export const logout = (): void => {
    if (typeof window !== "undefined") {
        sessionStorage.removeItem("cwu_token");
        sessionStorage.removeItem("cwu_user");
        sessionStorage.removeItem("cwu_email");
        sessionStorage.removeItem("cwu_id");
        sessionStorage.removeItem("cwu_permission");
        sessionStorage.removeItem("cwu_to_email");
    }
};
