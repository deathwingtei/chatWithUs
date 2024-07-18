const { validationResult } = require('express-validator');
const jsonwebtoken = require("jsonwebtoken");
const crypto = require('crypto');
const { expressjwt: expressJWT } = require("express-jwt");
const { curerntDate, getIPAddress } = require('../util/helper');
require('dotenv').config();
const User = require('../models/user');
const LoginLog = require('../models/loginLog');

exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const { password, email } = req.body;
    if (password && email) {
        const returnProcess = await registerProcess(email,password);
        if(returnProcess){
            return res.status(returnProcess.status).json(returnProcess);
        }else{
            return res.status(401).json({ status: 401, success: 0, result: "", message: "User not created." });
        }
    }
    else {
        res.status(401).json({ status: 401, success: 0, result: "", message: "Please Input All Feild" });
    }
};

exports.login = async (req, res) => {
    const hash = crypto.createHash('sha512');
    const keynnc = process.env.KEY_SECRET;
    const ip = getIPAddress();
    const { email, password } = req.body;
    if (email  && password) {
        let encpassword = hash.update(password + keynnc, 'utf-8').digest('hex');
        const returnProcess = await loginProcess(email,encpassword);
        if(returnProcess){
            return res.status(returnProcess.status).json(returnProcess);
        }else{
            return res.status(401).json({ status: 401, success: 0, result: "", message: "Incorrect Username or Password." });
        }
    }
    else {
        return res.status(401).json({ status: 401, success: 0, result: "", message: "Username and Password Must be fill." });
    }
};

exports.generateNewToken = (req, res) => {
    const hash = crypto.createHash('sha512');
    const keynnc = process.env.KEY_SECRET;
    let formattedDateTime = curerntDate();
    const ip = getIPAddress();
    token = req.headers.authorization.split(" ")[1];
  
    const userData = jsonwebtoken.verify(token,  process.env.JWT_SECRET).signData.split("_");
    const userID = userData[0];
    const userEmail = userData[1];
    if (userID != "" && userEmail != "" && userID != undefined && userEmail != undefined) {

    }
    else {
        return res.status(401).json({ status: 401, success: 0, result: "", message: "Invalid Token" });
    }
};

exports.loginWithAlwayNewToken = (req, res) => {
    const hash = crypto.createHash('sha512');
    const keynnc = process.env.KEY_SECRET;
    let formattedDateTime = curerntDate();
    const ip = getIPAddress();
    const { username, password } = req.body;
    if (username != "" && password != "" && username != undefined && password != undefined) {
        let encpassword = hash.update(password + keynnc, 'utf-8');
        encpassword = encpassword.digest('hex');
        return res.status(200).json({ status: 200, success: 1, result: "", message: username+" "+encpassword });
    }
    else {
        return res.status(401).json({ status: 401, success: 0, result: "", message: "No Login Data" });
    }
};
// https://apidog.com/articles/json-web-token-jwt-nodejs/

exports.changePassword = (req, res) => {
    const hash = crypto.createHash('sha512');
    const keynnc = process.env.KEY_SECRET;
    const { password, id } = req.body;
    let formattedDateTime = curerntDate();
    if (id != "" && password != "" && id != undefined && password != undefined ) {
        let encpassword = hash.update(password + keynnc, 'utf-8');
        encpassword = encpassword.digest('hex');
    }
    else {
        return res.status(401).json({ status: 401, success: 0, result: "", message: "Please Input All Feild" });
    }
};

exports.requireLogin = expressJWT({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
    userProperty: "auth",
    getToken: function fromHeaderOrQuerystring(req) {
        if (
            req.headers.authorization &&
            req.headers.authorization.split(" ")[0] === "Bearer"
        ) {
            return req.headers.authorization.split(" ")[1];
        } else if (req.query && req.query.token) {
            return req.query.token;
        }
        return null;
    }, onExpired: async (req, err) => {
        if (new Date() - err.inner.expiredAt < 5000) { return; }
        throw err;
    },
})

exports.verifyToken = (req, res, next) => {
    let token = req.query.token;
    if(token==""||token==null)
    {
        token = req.headers.authorization.split(" ")[1];
    }
    jsonwebtoken.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            // 401 Unauthorized -- 'Incorrect token'
            res.status(401).json({ status: 401, success: 0, result: "", message: "Incorrect token" });
        }
        else {
            req.user = decoded;
            console.log(decoded)
            res.status(200).json({ status: 200, success: 1, result: decoded, message: "Success" });
            next();
        }
    });
}


exports.googleAuth = async (req, res, next) => {
    const endpoint = "https://oauth2.googleapis.com/tokeninfo";
    // console.log(req.body.credential);
    // Send request to Google to authenticate token
    try {
        const result = await fetch(`${endpoint}?id_token=${req.body.credential}`);
        if (!result.ok) {
            throw new Error("Failed to authenticate token");
        }
        const jwt = await result.json();
        const email = jwt.email;
        const name = jwt.name;
        const picture = jwt.picture;
        //   console.log(jwt);
        if (email) {
            // TODO: Code to look up user in DB by jwt.email
           const returnProcess = await loginProcess(email,"","google");
           if(returnProcess.status==200){
                // has user. login
                return res.status(returnProcess.status).json(returnProcess);
           }else{
                // not has user. register
                const hash = crypto.createHash('sha512');
                const keynnc = process.env.KEY_SECRET;
                const password = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
                let encpassword = hash.update(password + keynnc, 'utf-8').digest('hex');
          
                const returnRegisterProcess = await registerProcess(email,encpassword,name,picture,true);
                if(returnRegisterProcess){
                    if(returnRegisterProcess.status==200){
                        // register complete auto login
                        const returnLoginProcess = await loginProcess(email,"","google");
                        return res.status(returnLoginProcess.status).json(returnLoginProcess);
                    }
                    // return res.status(returnRegisterProcess.status).json(returnRegisterProcess);
                }else{
                    return res.status(401).json({ status: 401, success: 0, result: "", message: "User not created." });
                }
           }
           
        }
    } catch (err) {
      return res.status(500).json({ status: 500, success: 0, result: '', message: (err.message) });
    }
}

async function loginProcess (email,password = "",logintype=""){
    let userResult;
    const ip = getIPAddress();

    if (!email) {
        return {
            status: 401,
            success: 0,
            result: "",
            message: "Email / Password Required"
        };
    }

    try {
        if (password) {
            userResult = await User.findOne({ email: email, password: password });
        } else {
            userResult = await User.findOne({ email: email });
        }

        if (userResult) {
            // Has User. Login
            const signData = userResult._id.toString() + "_" + userResult.email;
            const token = jsonwebtoken.sign({ signData }, process.env.JWT_SECRET);
            const ret = {
                token: token,
                id: userResult._id.toString(),
                email: userResult.email,
                name: userResult.name,
                permission: userResult.permission
            };

            await LoginLog.create({ userId: userResult._id.toString(), message: 'Login Complete', loginWith: logintype, ipAddress:ip });

            return {
                status: 200,
                success: 1,
                result: ret,
                message: "Login Success"
            };
        } else {
            // No User found
            return {
                status: 401,
                success: 0,
                result: "",
                message: "Incorrect Username or Password."
            };
        }
    } catch (err) {
        console.error(err);
        return {
            status: 500,
            success: 0,
            result: "",
            message: "Internal Server Error."
        };
    }
}

async function registerProcess (email,password,name = "",picture = "",google = false){
    if (email  && password) {
        const hash = crypto.createHash('sha512');
        const keynnc = process.env.KEY_SECRET;
        let encpassword = hash.update(password + keynnc, 'utf-8');
        encpassword = encpassword.digest('hex');
        if(name===""){
            name = email;
        }
        try {
            const userResult = await User.create({email: email,password: encpassword,name: name,userPicture: picture, googleLogin:google});
            if(userResult){
                return {status: 200, success: 1, result: "Success",message:"Insert Data Complete "+email};
            }else{
                return {status: 400, success: 0, result: "Error",message:"Can not Create User"};
            }
        } catch (err) {
            console.error(err);
            return {
                status: 500,
                success: 0,
                result: "",
                message: "Internal Server Error."
            };
        }
    }
}