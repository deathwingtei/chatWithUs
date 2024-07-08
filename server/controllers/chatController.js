const mongoose = require('mongoose');
const Socket= require("../socket_with_auth").socket;
const jsonwebtoken = require("jsonwebtoken");
const User = require('../models/user');
const Chat = require('../models/chat');
const ChatMessage = require('../models/ChatMessage');
const {microtime} = require('../util/helper');


exports.chatRoom  =  (req, res) => {
    const message = req.body.message
    const time = req.body.time;
    const chatId = req.body.chatId;
    const email = req.body.email;
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
            const userData = decoded.signData.split("_");
            const userID = userData[0];
            const userEmail = userData[1];

            User.findOne({ email: userEmail }).then((userResult)=>{
                
                const jsondata = {
                    message:message,
                    time:time,
                    name:userResult.name,
                    permission:userResult.permission,
                }
                // save chat message
                Chat.findOne({ _id: (chatId),active: true }).then((chatResult)=>{
                    if(chatResult!="" && chatResult!=null){

                        // found this chat. add data to db
                        const addChat = new ChatMessage({
                            data: message,
                            sender: userResult.permission,
                            userId: userResult._id.toString(),
                            chatId: chatId
                        });
                        addChat.save();

                        const soc = Socket.getIo();
                        soc.to(email).emit('chat:message', jsondata);
                        return res.status(200).json(jsondata);
                    }else{
                        return res.status(500).json({ status: 500, success: 0, result: "", message: "chat not found." });
                    }
                }).catch((err) => {
                    return res.status(500).json({ status: 500, success: 0, result: "", message: err });
                });
                // const soc = Socket.getIo();
                // soc.to(userResult.email).emit('chat:message', jsondata);
                // return res.status(200).json(jsondata);
            }).catch((err) => {
                return res.status(401).json({ status: 401, success: 0, result: "", message: err });
            });
        }
    });
}

exports.previousChat = (req, res) => {
    let token = req.query.token;
    let skip = (req.query.skip)?req.query.skip:0;
    let jsondata = {
        title:'',
        chatId:'',
        chatMessage:[]
    }
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
            const userData = decoded.signData.split("_");
            const userID = userData[0];
            const userEmail = userData[1];

            User.findOne({ email: userEmail }).then((userResult)=>{
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
                       
                            return res.status(200).json(jsondata);
                        }).catch((err) => {
                            return res.status(500).json({ status: 500, success: 0, result: "", message: err });
                        });
                    }else{
                        // add new chat
                        const now = new Date();
                        const newChat = new Chat({
                            title: userEmail+"_"+microtime(now),
                            active: 1,
                            userId: thisUserId
                        });
                        newChat.save();
                        jsondata = {
                            title:newChat.title,
                            chatId:newChat._id.toString(),
                        }
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

exports.previousCustomerChat = (req, res) => {
    let token = req.query.token;
    let skip = (req.query.skip)?req.query.skip:0;
    let email = (req.query.email)?req.query.email:'';
    let jsondata = {
        title:'',
        chatId:'',
        chatMessage:[]
    }
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
            const userData = decoded.signData.split("_");
            const userID = userData[0];
            const userEmail = userData[1];
            if(email==''){
                return res.status(200).json(jsondata);
            }
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
                       
                            return res.status(200).json(jsondata);
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

exports.getUserList = (req, res) => {

    token = req.headers.authorization.split(" ")[1];

    jsonwebtoken.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            // 401 Unauthorized -- 'Incorrect token'
            res.status(401).json({ status: 401, success: 0, result: "", message: "Incorrect token" });
        }
        else {
            const userData = decoded.signData.split("_");
            const userID = userData[0];
            const userEmail = userData[1];
            // check admin permission
            User.findOne({ _id: userID }).then((userResult)=>{
                if(userResult.permission=="admin"){
                    Chat.aggregate([ 
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
                    ]).then((chatResult)=>{
                        if(chatResult!="" && chatResult!=null){
                            let allChat = chatResult.map(thisChat => {
                                return {
                                    title: thisChat.title,
                                    datetime:thisChat.createdAt,
                                    name: thisChat.userDetails.name,
                                    email: thisChat.userDetails.email
                                };
                            });

                            return res.status(200).json({ status: 200, success: 1, result: allChat, message: "" });
                        }else{
                            return res.status(500).json({ status: 500, success: 0, result: "", message: "Chat Not Found" });
                        }
                    }).catch((err) => {
                        return res.status(500).json({ status: 500, success: 0, result: "", message: err });
                    });
                }else{
                    return res.status(401).json({ status: 401, success: 0, result: "", message: "Permission Denied" });
                }
            });
        }
    });
}

exports.adminChatRoom = (req, res) => {
    const jsondata = {
 
    }
    return res.status(200).json(jsondata);
}