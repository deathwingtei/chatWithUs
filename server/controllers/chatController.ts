import { Request, Response } from 'express';
import mongoose from 'mongoose';
import moment from 'moment';
import { socket } from "../socket_with_auth";
import jsonwebtoken from "jsonwebtoken";
import User from '../models/user';
import Chat from '../models/chat';
import ChatMessage from '../models/chatMessage';
import NotificationLog from '../models/notificationLog';
import sendEmail from '../services/mailer';
import sendNotification from '../services/lineNotification';

function changeEmailAndJoinRoom(socketId: string, newEmail: string) {
    socket.updateSocketEmailAndJoinRoom(socketId, newEmail);
}

export const chatRoom = async (req: Request, res: Response): Promise<any> => {
    try {
        const message = req.body.message;
        const time = req.body.time;
        const chatId = req.body.chatId;
        const email = req.body.email;
        let token = req.query.token as string;
        if (!token && req.headers.authorization) {
            token = req.headers.authorization.split(" ")[1];
        }

        const secret = process.env.JWT_SECRET || '';
        const decoded = jsonwebtoken.verify(token, secret) as any;
        const userData = decoded.signData.split("_");
        const userEmail = userData[1];

        const userResult = await User.findOne({ email: userEmail });
        if (userResult) {
            const jsondata = {
                message: message,
                time: time,
                name: userResult.name,
                permission: userResult.permission,
            };

            const findChat = await Chat.findOne({ _id: chatId, active: true });
            if (!findChat) {
                return res.status(200).json({ status: 200, success: 0, result: "", message: "" });
            }
            const addChat = new ChatMessage({
                data: message,
                sender: userResult.permission,
                userId: userResult._id.toString(),
                chatId: chatId
            });
            await addChat.save();

            const soc = socket.getIo();
            if (soc) {
                soc.to(email).emit('chat:message', jsondata);
            }

            if (userResult.permission !== "admin") {
                const appUrl = process.env.APPLICATION_URL || '';
                const messageToAdmin = `Has new user (${userResult.name}) send message. Please visit ${appUrl} for response`;
                const oneHourAgo = moment().subtract(1, 'hours').toDate();
                const recentLogs = await NotificationLog.find({
                    chatId,
                    createdAt: { $gte: oneHourAgo }
                });
                if (recentLogs.length <= 0) {
                    if (process.env.LINE_NOTIFY_TOKEN) {
                        const result = await sendNotification(messageToAdmin);
                        if (result.status === 200) {
                            const notiLog = new NotificationLog({
                                notificationTo: process.env.LINE_NOTIFY_TOKEN,
                                notificationType: 'lineNotify',
                                chatId: chatId,
                            });
                            await notiLog.save();
                        }
                    } else if (process.env.GMAIL_USERNAME && process.env.GMAIL_PASSWORD) {
                        let sendEmailUser: string[] = [];
                        const adminEmail = await User.find({ permission: 'admin' });
                        for (const key in adminEmail) {
                            sendEmailUser = [...sendEmailUser, adminEmail[key].email];
                        }
                        try {
                            const info = await sendEmail(sendEmailUser, `New User Contract : ${userResult.name} `, messageToAdmin);
                            if (info) {
                                const notiLog = new NotificationLog({
                                    notificationTo: JSON.stringify(sendEmailUser),
                                    notificationType: 'email',
                                    chatId: chatId,
                                });
                                await notiLog.save();
                            }
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }
                return res.status(200).json(jsondata);
            } else {
                return res.status(200).json(jsondata);
            }
        } else {
            return res.status(401).json({ status: 401, success: 0, result: "", message: "Permission Denied" });
        }
    } catch (err: any) {
        console.error(err);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ status: 401, success: 0, result: "", message: "Incorrect token" });
        }
        return res.status(500).json({ status: 500, success: 0, result: "", message: "Internal Server Error" });
    }
};

export const previousChat = async (req: Request, res: Response): Promise<any> => {
    let token = req.query.token as string;
    let skip = req.query.skip ? parseInt(req.query.skip as string) : 0;
    let jsondata: any = {
        title: '',
        chatId: '',
        chatMessage: []
    };

    if (!token && req.headers.authorization) {
        token = req.headers.authorization.split(" ")[1];
    }

    try {
        const secret = process.env.JWT_SECRET || '';
        const decoded = jsonwebtoken.verify(token, secret) as any;
        const userData = decoded.signData.split("_");
        const userEmail = userData[1];

        const userResult = await User.findOne({ email: userEmail });
        if (!userResult) {
            return res.status(401).json({ status: 401, success: 0, result: "", message: "No Authenticate" });
        }

        const thisUserId = userResult._id.toString();
        let chatResult = await Chat.findOne({ userId: thisUserId, active: true });

        if (chatResult) {
            const chatId = chatResult._id.toString();
            jsondata = {
                title: chatResult.title,
                chatId: chatId
            };

            const chatMessageResult = await ChatMessage.aggregate([
                {
                    $match: {
                        chatId: new mongoose.Types.ObjectId(chatId),
                        discard: false
                    }
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                },
                {
                    $skip: skip
                },
                {
                    $limit: 10
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                { $unwind: '$userDetails' }
            ]);

            if (chatMessageResult) {
                let allMessage = chatMessageResult.map((thisMsg: any) => {
                    return {
                        data: thisMsg.data,
                        imageUrl: thisMsg.imageUrl,
                        sender: thisMsg.sender,
                        datetime: thisMsg.createdAt,
                        name: thisMsg.userDetails.name
                    };
                });

                allMessage.sort((a: any, b: any) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

                jsondata.chatMessage = allMessage;
            }

            return res.status(200).json(jsondata);
        } else {
            if (userResult.permission !== "admin") {
                const now = new Date();
                const newChat = new Chat({
                    title: `${userEmail}_${now.getTime()}`,
                    active: true,
                    userId: thisUserId
                });
                await newChat.save();

                jsondata = {
                    title: newChat.title,
                    chatId: newChat._id.toString(),
                };

                const allChat = await getAllChat();
                const soc = socket.getIo();
                if (soc) {
                    soc.emit('chat:cusList', allChat);
                }

                return res.status(200).json(jsondata);
            }
            return res.status(200).json(jsondata);
        }
    } catch (err: any) {
        console.error(err);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ status: 401, success: 0, result: "", message: "Incorrect token" });
        }
        return res.status(500).json({ status: 500, success: 0, result: "", message: err.message });
    }
};

export const previousCustomerChat = (req: Request, res: Response): any => {
    let token = req.query.token as string;
    let skip = req.query.skip ? parseInt(req.query.skip as string) : 0;
    let email = (req.query.email ? req.query.email : '') as string;
    let socketid = (req.query.socketid ? req.query.socketid : '') as string;
    let jsondata: any = {
        title: '',
        chatId: '',
        chatMessage: []
    };
    if (socketid === '') {
        return res.status(401).json({ status: 401, success: 0, result: "", message: "Incorrect Socket ID" });
    }
    if (!token && req.headers.authorization) {
        token = req.headers.authorization.split(" ")[1];
    }
    const secret = process.env.JWT_SECRET || '';
    jsonwebtoken.verify(token, secret, (err: any, decoded: any) => {
        if (err) {
            return res.status(401).json({ status: 401, success: 0, result: "", message: "Incorrect token" });
        } else {
            if (email === '') {
                return res.status(200).json(jsondata);
            }
            changeEmailAndJoinRoom(socketid, email);
            User.findOne({ email: email }).then((userResult) => {
                if (!userResult) {
                    return res.status(401).json({ status: 401, success: 0, result: "", message: "No Authenticate" });
                }
                const thisUserId = userResult._id.toString();
                Chat.findOne({ userId: thisUserId, active: true }).then((chatResult) => {
                    if (chatResult) {
                        const chatId = chatResult._id.toString();
                        jsondata = {
                            title: chatResult.title,
                            chatId: chatResult._id.toString(),
                        };
                        ChatMessage.aggregate([
                            {
                                $match: {
                                    chatId: new mongoose.Types.ObjectId(chatId),
                                    discard: false
                                }
                            },
                            {
                                $sort: {
                                    createdAt: -1
                                }
                            },
                            {
                                $skip: skip
                            },
                            {
                                $limit: 10
                            },
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'userId',
                                    foreignField: '_id',
                                    as: 'userDetails'
                                }
                            },
                            { $unwind: '$userDetails' }
                        ]).then((chatMessageResult) => {
                            if (chatMessageResult) {
                                let allMessage = chatMessageResult.map((thisMsg: any) => {
                                    return {
                                        data: thisMsg.data,
                                        imageUrl: thisMsg.imageUrl,
                                        sender: thisMsg.sender,
                                        datetime: thisMsg.createdAt,
                                        name: thisMsg.userDetails.name
                                    };
                                });
                                allMessage.sort((a: any, b: any) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
                                jsondata.chatMessage = allMessage;
                            }
                            return res.status(200).json({ status: 200, success: 1, result: jsondata, message: "" });
                        }).catch((err) => {
                            return res.status(500).json({ status: 500, success: 0, result: "", message: String(err) });
                        });
                    } else {
                        return res.status(200).json(jsondata);
                    }
                }).catch((err) => {
                    return res.status(500).json({ status: 500, success: 0, result: "", message: String(err) });
                });
            }).catch((err) => {
                return res.status(401).json({ status: 401, success: 0, result: "", message: "No Authenticate" });
            });
        }
    });
};

export const getUserList = async (req: Request, res: Response): Promise<any> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ status: 401, success: 0, result: "", message: "Unauthorized" });
        }
        const token = authHeader.split(" ")[1];
        const secret = process.env.JWT_SECRET || '';
        const decoded = jsonwebtoken.verify(token, secret) as any;
        const userData = decoded.signData.split("_");
        const userID = userData[0];

        const userResult = await User.findOne({ _id: userID });
        if (userResult && userResult.permission === "admin") {
            const allChat = await getAllChat();

            if (allChat !== "error") {
                return res.status(200).json({ status: 200, success: 1, result: allChat, message: "" });
            } else {
                return res.status(500).json({ status: 500, success: 0, result: "", message: "Internal Server Error" });
            }
        } else {
            return res.status(401).json({ status: 401, success: 0, result: "", message: "Permission Denied" });
        }
    } catch (err: any) {
        console.error(err);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ status: 401, success: 0, result: "", message: "Incorrect token" });
        }
        return res.status(500).json({ status: 500, success: 0, result: "", message: "Internal Server Error" });
    }
};

export const adminChatRoom = (req: Request, res: Response): any => {
    const jsondata = {};
    return res.status(200).json(jsondata);
};

export const archiveChat = async (req: Request, res: Response): Promise<any> => {
    try {
        const chatId = req.body.chatId;
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ status: 401, success: 0, result: "", message: "Unauthorized" });
        }
        const token = authHeader.split(" ")[1];
        const secret = process.env.JWT_SECRET || '';
        const decoded = jsonwebtoken.verify(token, secret) as any;
        const userData = decoded.signData.split("_");
        const userID = userData[0];

        const userResult = await User.findOne({ _id: userID });
        if (userResult && userResult.permission === "admin") {
            const update = await Chat.findOneAndUpdate(
                { _id: chatId },
                { $set: { active: false, inActiveUser: userID } },
                { new: true }
            );

            if (update) {
                const allChat = await getAllChat();
                const soc = socket.getIo();
                if (soc) {
                    soc.emit('chat:cusList', allChat);
                }
                return res.status(200).json({ status: 200, success: 1, result: allChat, message: "" });
            } else {
                return res.status(500).json({ status: 500, success: 0, result: "", message: "Internal Server Error" });
            }
        } else {
            return res.status(401).json({ status: 401, success: 0, result: "", message: "Permission Denied" });
        }
    } catch (err: any) {
        console.error(err);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ status: 401, success: 0, result: "", message: "Incorrect token" });
        }
        return res.status(500).json({ status: 500, success: 0, result: "", message: "Internal Server Error" });
    }
};

async function getAllChat() {
    try {
        const chatResult = await Chat.aggregate([
            {
                $match: {
                    active: true
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            { $unwind: '$userDetails' }
        ]);

        if (chatResult && chatResult.length > 0) {
            let allChat = chatResult.map((thisChat: any) => {
                return {
                    title: thisChat.title,
                    datetime: thisChat.createdAt,
                    name: thisChat.userDetails.name,
                    email: thisChat.userDetails.email
                };
            });
            return allChat;
        } else {
            return "";
        }
    } catch (error) {
        return "error";
    }
}
