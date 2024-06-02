const jsonwebtoken = require("jsonwebtoken");
const crypto = require('crypto');
const { expressjwt: expressJWT } = require("express-jwt");
const { curerntDate, getIPAddress } = require('../util/helper');

const User = require('../models/user');

exports.login = (req, res) => {
    const hash = crypto.createHash('sha512');
    const keynnc = process.env.KEY_SECRET;
    let formattedDateTime = curerntDate();
    const ip = getIPAddress();
    const { username, password } = req.body;
    if (username != "" && password != "" && username != undefined && password != undefined) {
        let encpassword = hash.update(password + keynnc, 'utf-8');
        encpassword = encpassword.digest('hex');
        // res.status(400).json({ status: 400, success: 0, result: "", message: username+" "+encpassword });
        mysql_database.execute('SELECT * FROM `user` WHERE `email` = ? AND `password` = ? AND `discard` = ?', [username, encpassword, 0]).then(LoginData => {
            const userDataRow = LoginData[0].length;
            const userData = LoginData[0][0];
            const userID = userData.id;
            const signData = userID+"_"+username;
            if (userDataRow == 1) {
                mysql_database.execute('SELECT * FROM `token` WHERE `user_id` = ? AND `discard` = ?', [userID, 0]).then(oldTokenQuery => {

                    const oldTokenDataRow = oldTokenQuery[0].length;
                    const oldTokenData = oldTokenQuery[0][0];
                    if(oldTokenDataRow<=0)
                    {
                        // const token = jsonwebtoken.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1d' });
                        const token = jsonwebtoken.sign({ signData }, process.env.JWT_SECRET);
                        // add token to DB and login for user
                        mysql_database.execute('INSERT INTO `user_login`(`user_id`, `login_token`, `ip`, `datetime_created`) VALUES (?,?,?,?)', [userID, token,ip,formattedDateTime]).then(InsertLoginData => {
                            // Update ot insert Lastest Token
                            // Insert Token
                            mysql_database.execute('INSERT INTO `token`(`user_id`, `token`, `ip`, `datetime_created`) VALUES (?,?,?,?)', [userID, token,ip,formattedDateTime]).then(InsertTokenData => {
                                return res.status(200).json({ status: 200, success: 1, result: { token:token, email:userData.email, name:userData.name, id:userID }, message: "Login Complete" })
                            }).catch(err => {
                                console.log(err)
                                res.status(500).json({ status: 500, success: 0, result: err, message: "Error Token Insert" });
                            });
                        }).catch(err => {
                            console.log(err)
                            res.status(500).json({ status: 500, success: 0, result: err, message: "Error" });
                        });
                    }
                    else
                    {
                        const token = oldTokenData.token
                        return res.status(200).json({ status: 200, success: 1, result: { token:token, email:userData.email, name:userData.name, id:userID }, message: "Login Complete" })
                    }
                }).catch(err => {
                    console.log(err)
                    res.status(500).json({ status: 500, success: 0, result: err, message: "Error" });
                });


            }
            else {
                return res.status(401).json({ status: 401, success: 0, result: "", message: "Login Incomplete. Incorect username/password" });
            }
        }).catch(err => {
            console.log(err)
            res.status(500).json({ status: 500, success: 0, result: err, message: "Error" });
        });
    }
    else {
        res.status(401).json({ status: 401, success: 0, result: "", message: "No Login Data" });
    }
};

exports.generateNewToken = (req, res) => {
    const hash = crypto.createHash('sha512');
    const keynnc = process.env.KEY_SECRET;
    let formattedDateTime = curerntDate();
    const ip = getIPAddress();
    token = req.headers.authorization.split(" ")[1];
  
    const userData = jsonwebtoken.verify(token,  process.env.JWT_SECRET).signData.split("_");
    console.log(userData);
    console.log(userData);
    const userID = userData[0];
    const userEmail = userData[1];
    if (userID != "" && userEmail != "" && userID != undefined && userEmail != undefined) {
        mysql_database.execute('SELECT * FROM `user` WHERE `email` = ? AND `id` = ? AND `discard` = ?', [userEmail, userID, 0]).then(LoginData => {
            const userDataRow = LoginData[0].length;
            const userData = LoginData[0][0];
            const userID = userData.id;
            const signData = userID+"_"+userEmail;
            if (userDataRow == 1) {
                mysql_database.execute('SELECT * FROM `token` WHERE `user_id` = ? AND `discard` = ?', [userID, 0]).then(oldTokenQuery => {
                    const token = jsonwebtoken.sign({ signData }, process.env.JWT_SECRET);
                    mysql_database.execute('INSERT INTO `token`(`user_id`, `token`, `ip`, `datetime_created`) VALUES (?,?,?,?)', [userID, token,ip,formattedDateTime]).then(InsertTokenData => {
                        return res.status(200).json({ status: 200, success: 1, result: { token:token }, message: "Generate Token Complete" })
                    }).catch(err => {
                        console.log(err)
                        res.status(500).json({ status: 500, success: 0, result: err, message: "Error Token Insert" });
                    });
                }).catch(err => {
                    console.log(err)
                    res.status(500).json({ status: 500, success: 0, result: err, message: "Error Mysql Insert Token" });
                });
            }
            else {
                return res.status(401).json({ status: 401, success: 0, result: "", message: "Invalid Token Format" });
            }
        }).catch(err => {
            console.log(err)
            res.status(500).json({ status: 500, success: 0, result: err, message: "Error Token data not found." });
        });
    }
    else {
        res.status(401).json({ status: 401, success: 0, result: "", message: "Invalid Token" });
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
        // res.status(400).json({ status: 400, success: 0, result: "", message: username+" "+encpassword });
        mysql_database.execute('SELECT * FROM `user` WHERE `email` = ? AND `password` = ? AND `discard` = ?', [username, encpassword, 0]).then(LoginData => {
            const userDataRow = LoginData[0].length;
            const userData = LoginData[0][0];
            const userID = userData.id;
            const signData = userID+"_"+username;
            if (userDataRow == 1) {
                // const token = jsonwebtoken.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1d' });
                const token = jsonwebtoken.sign({ signData }, process.env.JWT_SECRET);
                // add token to DB and login for user
                mysql_database.execute('INSERT INTO `user_login`(`user_id`, `login_token`, `ip`, `datetime_created`) VALUES (?,?,?,?)', [userID, token,ip,formattedDateTime]).then(InsertLoginData => {
                    // Update ot insert Lastest Token
                    mysql_database.execute('SELECT * FROM `token` WHERE `user_id` = ? AND `discard` = ?', [userID, 0]).then(oldTokenQuery => {

                        const oldTokenDataRow = oldTokenQuery[0].length;
                        const oldTokenData = oldTokenQuery[0][0];
                        if(oldTokenDataRow>0)
                        {
                            // Update Token
                            mysql_database.execute('UPDATE `token` SET `token`=?,`lastest_ip`=?,`datetime_updated`=? WHERE `user_id`=?', [token,ip,formattedDateTime,userID]).then(InsertTokenData => {
                                return res.status(200).json({ status: 200, success: 1, result: { token:token, email:userData.email, name:userData.name, id:userID }, message: "Login Complete" })
                            }).catch(err => {
                                console.log(err)
                                res.status(500).json({ status: 500, success: 0, result: err, message: "Error Token Insert" });
                            });
                            
                        }
                        else
                        {
                            // Insert Token
                            mysql_database.execute('INSERT INTO `token`(`user_id`, `token`, `ip`, `datetime_created`) VALUES (?,?,?,?)', [userID, token,ip,formattedDateTime]).then(InsertTokenData => {
                                return res.status(200).json({ status: 200, success: 1, result: { token:token, email:userData.email, name:userData.name, id:userID }, message: "Login Complete" })
                            }).catch(err => {
                                console.log(err)
                                res.status(500).json({ status: 500, success: 0, result: err, message: "Error Token Insert" });
                            });
                        }
                    }).catch(err => {
                        console.log(err)
                        res.status(500).json({ status: 500, success: 0, result: err, message: "Error" });
                    });
                }).catch(err => {
                    console.log(err)
                    res.status(500).json({ status: 500, success: 0, result: err, message: "Error" });
                });
            }
            else {
                return res.status(401).json({ status: 401, success: 0, result: "", message: "Login Incomplete. Incorect username/password" });
            }
        }).catch(err => {
            console.log(err)
            res.status(500).json({ status: 500, success: 0, result: err, message: "Error" });
        });
    }
    else {
        res.status(401).json({ status: 401, success: 0, result: "", message: "No Login Data" });
    }
};
// https://apidog.com/articles/json-web-token-jwt-nodejs/

exports.register = (req, res) => {
    const hash = crypto.createHash('sha512');
    const keynnc = process.env.KEY_SECRET;
    const { name, password, email } = req.body;
    let formattedDateTime = curerntDate();
    if (name != "" && password != "" && email != "" && name != undefined && password != undefined && email != undefined) {
        let encpassword = hash.update(password + keynnc, 'utf-8');
        encpassword = encpassword.digest('hex');
        mysql_database.execute('SELECT * FROM `user` WHERE `email` = ? AND `discard` = ?', [email, 0]).then(LoginData => {
            const userDataRow = LoginData[0].length;

            if (userDataRow >= 1) {
                // has this email reject
                return res.status(400).json({ status: 401, success: 0, result: "", message: "Email is taken" });
            }
            else {
                // add data to DB
                mysql_database.execute('INSERT INTO `user`(`name`, `email`, `password`, `datetime_created`) VALUES (?,?,?,?)', [name, email,encpassword,formattedDateTime]).then(registerData => {
                    return res.status(200).json({ status: 200, success: 1, result: { name, email }, message: email+" Register Complete" });
                }).catch(err => {
                    console.log(err)
                    res.status(500).json({ status: 500, success: 0, result: err, message: "Error" });
                });
            }
        }).catch(err => {
            console.log(err)
            res.status(500).json({ status: 500, success: 0, result: err, message: "Error" });
        });
    }
    else {
        res.status(401).json({ status: 401, success: 0, result: "", message: "Please Input All Feild" });
    }
};

exports.changePassword = (req, res) => {
    const hash = crypto.createHash('sha512');
    const keynnc = process.env.KEY_SECRET;
    const { password, id } = req.body;
    let formattedDateTime = curerntDate();
    if (id != "" && password != "" && id != undefined && password != undefined ) {
        let encpassword = hash.update(password + keynnc, 'utf-8');
        encpassword = encpassword.digest('hex');
        mysql_database.execute('SELECT * FROM `user` WHERE `id` = ? AND `discard` = ?', [id, 0]).then(LoginData => {
            const userDataRow = LoginData[0].length;
            const userData = LoginData[0][0];
            if (userDataRow >= 1) {
                // add log and update password
                // add log
                mysql_database.execute('INSERT INTO `log_update`(`table_name`, `id_in_table`, `data`, `datetime_created`, `remark`) VALUES (?,?,?,?,?)', ['user', id,JSON.stringify(userData),formattedDateTime,'Change Password']).then(logUpdateData => {
                    // update password
                    mysql_database.execute('UPDATE `user` SET `password`=? WHERE `id`=?', [encpassword,id]).then(passwordUpdatedData => {
                        res.status(200).json({ status: 200, success: 1, result: "", message: "Success" });
                    }).catch(err => {
                        console.log(err)
                        res.status(500).json({ status: 500, success: 0, result: err, message: "Error Change Password" });
                    });
                }).catch(err => {
                    console.log(err)
                    res.status(500).json({ status: 500, success: 0, result: err, message: "Error Insert Log" });
                });
            }
            else {
                // Error not found user by id
                console.log(err)
                res.status(400).json({ status: 400, success: 0, result: err, message: "User Not Found" });
            }
        }).catch(err => {
            console.log(err)
            res.status(500).json({ status: 500, success: 0, result: err, message: "Error Select User" });
        });
    }
    else {
        res.status(401).json({ status: 401, success: 0, result: "", message: "Please Input All Feild" });
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


