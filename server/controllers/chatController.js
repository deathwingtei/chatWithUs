const mongoose = require('mongoose');
const moment = require('moment');
const { socket } = require("../socket_with_auth");
const jsonwebtoken = require("jsonwebtoken");
const User = require('../models/user');
const Chat = require('../models/chat');
const ChatMessage = require('../models/chatMessage');
const NotificationLog = require('../models/notificationLog');
const {microtime} = require('../util/helper');
const sendEmail = require('../services/mailer');
const sendNotification = require('../services/lineNotification');

function changeEmailAndJoinRoom(socketId, newEmail) {
    socket.updateSocketEmailAndJoinRoom(socketId, newEmail);
}

exports.chatRoom  = async (req, res) => {
    try {
        const message = req.body.message
        const time = req.body.time;
        const chatId = req.body.chatId;
        const email = req.body.email;
        let token = req.query.token;
        if(token==""||token==null)
        {
            token = req.headers.authorization.split(" ")[1];
        }

        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const userData = decoded.signData.split("_");
        const userID = userData[0];
        const userEmail = userData[1];

        // Check admin permission
        const userResult = await User.findOne({  email: userEmail });
        if (userResult) {

            const jsondata = {
                message:message,
                time:time,
                name:userResult.name,
                permission:userResult.permission,
            }

            const findChat = await Chat.findOne({ _id: (chatId),active: true });
            if(!findChat){
                return res.status(200).json({ status: 200, success: 0, result: "", message: "" });
            }
            const addChat = new ChatMessage({
                data: message,
                sender: userResult.permission,
                userId: userResult._id.toString(),
                chatId: chatId
            });
            addChat.save();

            const soc = socket.getIo();
            soc.to(email).emit('chat:message', jsondata);

            if(userResult.permission!=="admin"){
                // check notification and if not fine send noti to all admin email/linenotify if it has in env
                const appUrl = process.env.APPLICATION_URL;
                const messageToAdmin = `Has new user (${userResult.name}) send message. Please visit ${appUrl} for response`;
                // check log chat id previos 1 hour before send
                const oneHourAgo = moment().subtract(1, 'hours').toDate();
                const recentLogs = await NotificationLog.find({
                    chatId, // Match chatId
                    createdAt: { $gte: oneHourAgo } // Filter for logs created within the last hour
                });
                if(recentLogs.length <= 0){
                    if(process.env.LINE_NOTIFY_TOKEN){
                        // send line noti
                        const result = await sendNotification(messageToAdmin);
                        if(result.status==200){
                            // save log
                            const notiLog = new NotificationLog({
                                notificationTo:process.env.LINE_NOTIFY_TOKEN,
                                notificationType:'lineNotify',
                                chatId:chatId,
                            });
                            notiLog.save();
                        }
                    }
                    else if(process.env.GMAIL_USERNAME && process.env.GMAIL_PASSWORD){
                        // send mail admin
                        // find admin email
                        let sendEmailUser = [];
                        const adminEmail = await User.find({
                            permission:'admin', // Match chatId
                        });
                        for (const key in adminEmail) {
							// set message to chat
							sendEmailUser = [...sendEmailUser, adminEmail[key].email];
						}
                        try {
                            const info = await sendEmail(sendEmailUser, `New User Contract : ${userResult.name} `, messageToAdmin);
                            if(info){
                                const notiLog = new NotificationLog({
                                    notificationTo:JSON.stringify(sendEmailUser),
                                    notificationType:'email',
                                    chatId:chatId,
                                });
                                notiLog.save();
                                console.log(notiLog);
                            }
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }
                return res.status(200).json(jsondata);
            }else{
                return res.status(200).json(jsondata);
            }

        } else {
            return res.status(401).json({ status: 401, success: 0, result: "", message: "Permission Denied" });
        }
    } catch (err) {
        console.error(err);
        if (err.name === 'JsonWebTokenError') {
            // 401 Unauthorized -- 'Incorrect token'
            return res.status(401).json({ status: 401, success: 0, result: "", message: "Incorrect token" });
        }
        return res.status(500).json({ status: 500, success: 0, result: "", message: "Internal Server Error" });
    }
}

exports.previousChat = async (req, res) => {
    let token = req.query.token;
    let skip = req.query.skip ? parseInt(req.query.skip) : 0; // Ensure skip is an integer
    let jsondata = {
        title: '',
        chatId: '',
        chatMessage: []
    };

    if (!token) {
        token = req.headers.authorization.split(" ")[1];
    }

    try {
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const userData = decoded.signData.split("_");
        const userID = userData[0];
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
                        chatId: mongoose.Types.ObjectId(chatId),
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
                let allMessage = chatMessageResult.map(thisMsg => {
                    return {
                        data: thisMsg.data,
                        imageUrl: thisMsg.imageUrl,
                        sender: thisMsg.sender,
                        datetime: thisMsg.createdAt,
                        name: thisMsg.userDetails.name
                    };
                });

                allMessage.sort((a, b) => a.datetime - b.datetime);

                jsondata.chatMessage = allMessage;
            }

            return res.status(200).json(jsondata);
        } else {
            // Add new chat
            if (userResult.permission !== "admin") {
                const now = new Date();
                const newChat = new Chat({
                    title: `${userEmail}_${now.getTime()}`, // Using current timestamp instead of microtime
                    active: 1,
                    userId: thisUserId
                });
                await newChat.save();

                jsondata = {
                    title: newChat.title,
                    chatId: newChat._id.toString(),
                };

                const allChat = await getAllChat();
                const soc = socket.getIo();
                soc.emit('chat:cusList', allChat);

                return res.status(200).json(jsondata);
            }
        }
    } catch (err) {
        console.error(err);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ status: 401, success: 0, result: "", message: "Incorrect token" });
        }
        return res.status(500).json({ status: 500, success: 0, result: "", message: err.message });
    }
};

exports.previousCustomerChat = (req, res) => {
    let token = req.query.token;
    let skip = (req.query.skip)?req.query.skip:0;
    let email = (req.query.email)?req.query.email:'';
    let socketid = (req.query.socketid)?req.query.socketid:'';
    let jsondata = {
        title:'',
        chatId:'',
        chatMessage:[]
    }
    if(socketid==''){
        return res.status(401).json({ status: 401, success: 0, result: "", message: "Incorrect Socket ID" });
    }
    if( token==""||token==null )
    {
        token = req.headers.authorization.split(" ")[1];
    }
    jsonwebtoken.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            // 401 Unauthorized -- 'Incorrect token'
            return res.status(401).json({ status: 401, success: 0, result: "", message: "Incorrect token" });
        }
        else {
            const userData = decoded.signData.split("_");
            const userID = userData[0];
            const userEmail = userData[1];
            if(email==''){
                return res.status(200).json(jsondata);
            }
            changeEmailAndJoinRoom(socketid,email);
            User.findOne({ email: email }).then((userResult)=>{
                // has user. get chat 
                const thisUserId = userResult._id.toString();
                Chat.findOne({ userId: thisUserId,active: true }).then((chatResult)=>{
                    if(chatResult!="" && chatResult!=null){
                        // get chat message
                        const chatId = chatResult._id.toString();
                        jsondata = {
                            title:chatResult.title,
                            chatId:chatResult._id.toString(),
                        }
                        // ChatMessage.find({chatId:chatId,discard:false}).sort({ createdAt: -1 }).skip(skip).limit(5).then((chatMessageResult)=>{
                        ChatMessage.aggregate([ 
                            { 
                                $match: {
                                    chatId: mongoose.Types.ObjectId(chatId),
                                    discard: false
                                } 
                            },{
                                $sort: {
                                    createdAt: -1
                                }
                            },{
                                $skip: skip
                            },{
                                $limit: 10
                            },{
                                $lookup: {
                                    from: 'users',
                                    localField: 'userId',
                                    foreignField: '_id',
                                    as: 'userDetails'
                                }
                            },
                            { $unwind: '$userDetails' }
                        ]).then((chatMessageResult)=>{
                            if(chatMessageResult!="" && chatMessageResult!=null){
                                let allMessage = chatMessageResult.map(thisMsg => {
                                    return {
                                        data: thisMsg.data,
                                        imageUrl: thisMsg.imageUrl,
                                        sender: thisMsg.sender,
                                        datetime:thisMsg.createdAt,
                                        name: thisMsg.userDetails.name
                                    };
                                });
                       
                                allMessage.sort((a, b) => a.datetime - b.datetime); 
                        
                                jsondata.chatMessage = allMessage;
                            }
                       
                            return res.status(200).json({ status: 200, success: 1, result: jsondata, message: err });
                        }).catch((err) => {
                            return res.status(500).json({ status: 500, success: 0, result: "", message: err });
                        });
                    }else{
                        // add new chat
                        // const now = new Date();
                        // const newChat = new Chat({
                        //     title: email+"_"+microtime(now),
                        //     active: 1,
                        //     userId: thisUserId
                        // });
                        // newChat.save();
                        // jsondata = {
                        //     title:newChat.title,
                        //     chatId:newChat._id.toString(),
                        // }
                        return res.status(200).json(jsondata);
                    }
                }).catch((err) => {
                    return res.status(500).json({ status: 500, success: 0, result: "", message: err });
                });
            }).catch((err) => {
                return res.status(401).json({ status: 401, success: 0, result: "", message: "No Authenticate" });
            });
        }
    });
}

exports.getUserList = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];

        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const userData = decoded.signData.split("_");
        const userID = userData[0];
        const userEmail = userData[1];

        // Check admin permission
        const userResult = await User.findOne({ _id: userID });
        if (userResult.permission === "admin") {
            // Get all chat
            const allChat = await getAllChat();

            if (allChat !== "error") {
                return res.status(200).json({ status: 200, success: 1, result: allChat, message: "" });
            } else {
                return res.status(500).json({ status: 500, success: 0, result: "", message: "Internal Server Error" });
            }
        } else {
            return res.status(401).json({ status: 401, success: 0, result: "", message: "Permission Denied" });
        }
    } catch (err) {
        console.error(err);
        if (err.name === 'JsonWebTokenError') {
            // 401 Unauthorized -- 'Incorrect token'
            return res.status(401).json({ status: 401, success: 0, result: "", message: "Incorrect token" });
        }
        return res.status(500).json({ status: 500, success: 0, result: "", message: "Internal Server Error" });
    }
};

exports.adminChatRoom = (req, res) => {
    const jsondata = {
 
    }
    return res.status(200).json(jsondata);
}

exports.archiveChat = async (req, res) => {
    try {
        const chatId = req.body.chatId;
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const userData = decoded.signData.split("_");
        const userID = userData[0];
        const userEmail = userData[1];

        console.log(chatId);
        console.log(userID);

        // Check admin permission
        const userResult = await User.findOne({ _id: userID });
        if (userResult.permission === "admin") {
            // Get chat and update
            const update = await Chat.findOneAndUpdate(
                { _id: chatId }, // Filter to find the document
                { $set: { active: false, inActiveUser: userID } }, // Update operation
                { new: true } // Option to return the updated document
            );

            if (update !== "error") {
                const allChat = await getAllChat();
                const soc = socket.getIo();
                soc.emit('chat:cusList', allChat);
                return res.status(200).json({ status: 200, success: 1, result: allChat, message: "" });
            } else {
                return res.status(500).json({ status: 500, success: 0, result: "", message: "Internal Server Error" });
            }
        } else {
            return res.status(401).json({ status: 401, success: 0, result: "", message: "Permission Denied" });
        }
    } catch (err) {
        console.error(err);
        if (err.name === 'JsonWebTokenError') {
            // 401 Unauthorized -- 'Incorrect token'
            return res.status(401).json({ status: 401, success: 0, result: "", message: "Incorrect token" });
        }
        return res.status(500).json({ status: 500, success: 0, result: "", message: "Internal Server Error" });
    }
}

async function getAllChat (){
    const chatResult = await Chat.aggregate([
        { 
            $match: {
                active: true
            } 
        },{
            $sort: {
                createdAt: -1
            }
        },{
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        { $unwind: '$userDetails' }
    ])
        
    if(chatResult!="" && chatResult!=null){
        let allChat = chatResult.map(thisChat => {
            return {
                title: thisChat.title,
                datetime:thisChat.createdAt,
                name: thisChat.userDetails.name,
                email: thisChat.userDetails.email
            };
        });
        return allChat;
    }else{
        return "";
    }

}