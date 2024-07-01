const { validationResult } = require('express-validator');
const jsonwebtoken = require("jsonwebtoken");
const crypto = require('crypto');
const { expressjwt: expressJWT } = require("express-jwt");
const { curerntDate, getIPAddress } = require('../util/helper');
require('dotenv').config();
const User = require('../models/user');

exports.register = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed.');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const hash = crypto.createHash('sha512');
    const keynnc = process.env.KEY_SECRET;
    const { password, email } = req.body;
    if (password != "" && email != "" && password != undefined && email != undefined) {
        let encpassword = hash.update(password + keynnc, 'utf-8');
        encpassword = encpassword.digest('hex');
        User.create({email: email,password: encpassword,name: email}).then((result)=>{
            return res.status(200).json({status: 200, success: 1, result: "Success",message:"Insert Data Complete "+email});
        }).catch((err) => {
            return res.status(400).json({status: 400, success: 0, result: "Error",message:err});
        });
    }
    else {
        res.status(401).json({ status: 401, success: 0, result: "", message: "Please Input All Feild" });
    }
};

exports.login = (req, res) => {
    const hash = crypto.createHash('sha512');
    const keynnc = process.env.KEY_SECRET;
    const ip = getIPAddress();
    const { email, password } = req.body;
    if (email != "" && password != "" && email != undefined && password != undefined) {
        let encpassword = hash.update(password + keynnc, 'utf-8');
        encpassword = encpassword.digest('hex');
        User.findOne({ email: email,password: encpassword }).then((result)=>{
            return res.status(200).json({ status: 200, success: 0, result: "", message: email+" "+encpassword });
        }).catch((err) => {
            return res.status(401).json({ status: 400, success: 0, result: "", message: err });
        });
    }
    else {
        return res.status(401).json({ status: 401, success: 0, result: "", message: "Incorrect Username or Password." });
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
        return res.status(400).json({ status: 400, success: 0, result: "", message: username+" "+encpassword });

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


