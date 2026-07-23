import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import jsonwebtoken from "jsonwebtoken";
import crypto from 'crypto';
import { expressjwt as expressJWT } from "express-jwt";
import { curerntDate, getIPAddress } from '../util/helper';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/user';
import LoginLog from '../models/loginLog';
import ChangeLog from '../models/changeLog';
import axios from 'axios';

export const register = async (req: Request, res: Response): Promise<any> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error: any = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const { password, email } = req.body;
    if (password && email) {
        const returnProcess = await registerProcess(email, password);
        if (returnProcess) {
            return res.status(returnProcess.status).json(returnProcess);
        } else {
            return res.status(400).json({ status: 400, success: 0, result: "", message: "User not created." });
        }
    } else {
        return res.status(422).json({ status: 422, success: 0, result: "", message: "Please Input All Feild" });
    }
};

export const login = async (req: Request, res: Response): Promise<any> => {
    const hash = crypto.createHash('sha512');
    const keynnc = process.env.KEY_SECRET || '';
    const { email, password } = req.body;
    if (email && password) {
        let encpassword = hash.update(password + keynnc, 'utf-8').digest('hex');
        const returnProcess = await loginProcess(email, encpassword);
        if (returnProcess) {
            return res.status(returnProcess.status).json(returnProcess);
        } else {
            return res.status(401).json({ status: 401, success: 0, result: "", message: "Incorrect Username or Password." });
        }
    } else {
        return res.status(401).json({ status: 401, success: 0, result: "", message: "Username and Password Must be fill." });
    }
};

export const generateNewToken = (req: Request, res: Response): any => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ status: 401, success: 0, result: "", message: "Invalid Token" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const secret = process.env.JWT_SECRET || '';
        const decoded = jsonwebtoken.verify(token, secret) as any;
        const userData = decoded.signData.split("_");
        const userID = userData[0];
        const userEmail = userData[1];
        if (userID && userEmail) {
            return res.status(200).json({ status: 200, success: 1, result: token, message: "Valid Token" });
        } else {
            return res.status(401).json({ status: 401, success: 0, result: "", message: "Invalid Token" });
        }
    } catch (err) {
        return res.status(401).json({ status: 401, success: 0, result: "", message: "Invalid Token" });
    }
};

export const loginWithAlwayNewToken = (req: Request, res: Response): any => {
    const hash = crypto.createHash('sha512');
    const keynnc = process.env.KEY_SECRET || '';
    const { username, password } = req.body;
    if (username && password) {
        let encpassword = hash.update(password + keynnc, 'utf-8').digest('hex');
        return res.status(200).json({ status: 200, success: 1, result: "", message: username + " " + encpassword });
    } else {
        return res.status(401).json({ status: 401, success: 0, result: "", message: "No Login Data" });
    }
};

export const changePassword = (req: Request, res: Response): any => {
    const { password } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ status: 401, success: 0, result: "", message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || '';
    const decoded = jsonwebtoken.verify(token, secret) as any;
    const userData = decoded.signData.split("_");
    const userID = userData[0];

    if (userID && password) {
        const hash = crypto.createHash('sha512');
        const keynnc = process.env.KEY_SECRET || '';
        let encpassword = hash.update(password + keynnc, 'utf-8').digest('hex');

        User.findOne({ _id: userID }).then((logResult) => {
            if (!logResult) {
                return res.status(404).json({ status: 404, success: 0, result: "", message: "User not found" });
            }
            const addLog = new ChangeLog({
                documentName: 'users',
                changeMessage: 'Update users password',
                logValue: logResult.toString(),
                ipAddress: getIPAddress(),
                userId: userID
            });
            addLog.save();
            
            User.findOneAndUpdate(
                { _id: userID },
                { $set: { password: encpassword } },
                { new: true }
            ).then((updateResult) => {
                return res.status(200).json({ status: 200, success: 1, result: updateResult, message: "Update Password Complete" });
            }).catch((err) => {
                return res.status(500).json({ status: 500, success: 0, result: "", message: String(err) });
            });
        }).catch((err) => {
            return res.status(500).json({ status: 500, success: 0, result: "", message: String(err) });
        });
    } else {
        return res.status(422).json({ status: 422, success: 0, result: "", message: "Please Input All Feild" });
    }
};

export const updateProfile = (req: Request, res: Response): any => {
    const { name, email } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ status: 401, success: 0, result: "", message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || '';
    const decoded = jsonwebtoken.verify(token, secret) as any;
    const userData = decoded.signData.split("_");
    const userID = userData[0];

    if (name && email && userID) {
        User.findOne({ email: email, _id: { $ne: userID } }).then((findDupplicateEmail) => {
            if (findDupplicateEmail) {
                return res.status(422).json({ status: 422, success: 0, result: "", message: "Email is taken." });
            } else {
                User.findOne({ _id: userID }).then((logResult) => {
                    if (!logResult) {
                        return res.status(404).json({ status: 404, success: 0, result: "", message: "User not found" });
                    }
                    const addLog = new ChangeLog({
                        documentName: 'users',
                        changeMessage: 'Update users name/email',
                        logValue: logResult.toString(),
                        ipAddress: getIPAddress(),
                        userId: userID
                    });
                    addLog.save();
                    
                    User.findOneAndUpdate(
                        { _id: userID },
                        { $set: { name: name, email: email } },
                        { new: true }
                    ).then((updateResult) => {
                        return res.status(200).json({ status: 200, success: 1, result: updateResult, message: "Update Successful" });
                    }).catch((err) => {
                        return res.status(500).json({ status: 500, success: 0, result: "", message: String(err) });
                    });
                }).catch((err) => {
                    return res.status(500).json({ status: 500, success: 0, result: "", message: String(err) });
                });
            }
        }).catch((err) => {
            return res.status(500).json({ status: 500, success: 0, result: "", message: String(err) });
        });
    } else {
        return res.status(422).json({ status: 422, success: 0, result: "", message: "Please Input All Feild" });
    }
};

export const requireLogin = expressJWT({
    secret: process.env.JWT_SECRET || '',
    algorithms: ["HS256"],
    requestProperty: "auth",
    getToken: function fromHeaderOrQuerystring(req: Request) {
        if (
            req.headers.authorization &&
            req.headers.authorization.split(" ")[0] === "Bearer"
        ) {
            return req.headers.authorization.split(" ")[1];
        } else if (req.query && req.query.token) {
            return req.query.token as string;
        }
        return undefined;
    },
    onExpired: async (req: Request, err: any) => {
        if (new Date().getTime() - err.inner.expiredAt < 5000) { return; }
        throw err;
    },
} as any);

export const verifyToken = (req: Request, res: Response, next: NextFunction): any => {
    let token = req.query.token as string;
    if (!token && req.headers.authorization) {
        token = req.headers.authorization.split(" ")[1];
    }
    const secret = process.env.JWT_SECRET || '';
    jsonwebtoken.verify(token, secret, (err: any, decoded: any) => {
        if (err) {
            return res.status(401).json({ status: 401, success: 0, result: "", message: "Incorrect token" });
        } else {
            (req as any).user = decoded;
            res.status(200).json({ status: 200, success: 1, result: decoded, message: "Success" });
            next();
        }
    });
};

export const googleAuth = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const endpoint = "https://oauth2.googleapis.com/tokeninfo";
    try {
        const getTokenUrl = `${endpoint}?id_token=${req.body.credential}`;
        const result = await axios.get(getTokenUrl);

        const jwt = result.data;
        const email = jwt.email;
        const name = jwt.name;
        const picture = jwt.picture;

        if (email) {
            const returnProcess = await loginProcess(email, "", "google");
            if (returnProcess.status === 200) {
                return res.status(returnProcess.status).json(returnProcess);
            } else {
                const hash = crypto.createHash('sha512');
                const keynnc = process.env.KEY_SECRET || '';
                const password = String(Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000);
                let encpassword = hash.update(password + keynnc, 'utf-8').digest('hex');
          
                const returnRegisterProcess = await registerProcess(email, encpassword, name, picture, true);
                if (returnRegisterProcess) {
                    if (returnRegisterProcess.status === 200) {
                        const returnLoginProcess = await loginProcess(email, "", "google");
                        return res.status(returnLoginProcess.status).json(returnLoginProcess);
                    }
                } else {
                    return res.status(400).json({ status: 400, success: 0, result: "", message: "User not created." });
                }
            }
        }
    } catch (err: any) {
        return res.status(500).json({ status: 500, success: 0, result: '', message: err.message });
    }
};

async function loginProcess(email: string, password: string = "", logintype: string = "") {
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
            const signData = userResult._id.toString() + "_" + userResult.email;
            const secret = process.env.JWT_SECRET || '';
            const token = jsonwebtoken.sign({ signData }, secret);
            const ret = {
                token: token,
                id: userResult._id.toString(),
                email: userResult.email,
                name: userResult.name,
                permission: userResult.permission
            };

            await LoginLog.create({ userId: userResult._id.toString(), message: 'Login Complete', loginWith: logintype, ipAddress: ip });

            return {
                status: 200,
                success: 1,
                result: ret,
                message: "Login Success"
            };
        } else {
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

async function registerProcess(email: string, password: string, name: string = "", picture: string = "", google: boolean = false) {
    if (email && password) {
        const hash = crypto.createHash('sha512');
        const keynnc = process.env.KEY_SECRET || '';
        let encpassword = hash.update(password + keynnc, 'utf-8').digest('hex');
        if (name === "") {
            name = email;
        }
        try {
            const userResult = await User.create({ email: email, password: encpassword, name: name, userPicture: picture, googleLogin: google });
            if (userResult) {
                return { status: 200, success: 1, result: "Success", message: "Insert Data Complete " + email };
            } else {
                return { status: 400, success: 0, result: "Error", message: "Can not Create User" };
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
