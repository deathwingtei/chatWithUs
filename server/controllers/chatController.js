const User = require('../models/user');
const Chat = require('../models/chat');
const ChatMessage = require('../models/ChatMessage');
const Socket= require("../socket_with_auth").socket;
const jsonwebtoken = require("jsonwebtoken");

exports.chatRoom  =  (req, res) => {
    const message = req.body.message
    const time = req.body.time;
    const chatId = req.body.chatId;
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

            User.findOne({ email: userEmail }).then((result)=>{
                
                const jsondata = {
                    message:message,
                    time:time,
                    name:result.name,
                    permission:result.permission,
                }

                const soc = Socket.getIo();
                soc.to(result.email).emit('chat:message', jsondata);

                return res.status(200).json(jsondata);

            }).catch((err) => {
                return res.status(401).json({ status: 401, success: 0, result: "", message: "No Authenticate" });
            });
        }
    });


}

exports.previousChat = (req, res) => {
    let token = req.query.token;
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
                        ChatMessage.find({chatId:chatId,discard:false}).then((chatMessageResult)=>{
                            if(chatMessageResult!="" && chatMessageResult!=null){
                                const allMessage = chatMessageResult.map(thisMsg => {
                                    return {
                                        data: thisMsg.data,
                                        imageUrl: thisMsg.imageUrl,
                                        sender: thisMsg.sender,
                                        datetime:thisMsg.createdAt
                                    };
                                });
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
                            title: userEmail+"_"+now,
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


exports.adminChatRoom = (req, res) => {
    const jsondata = {
 
    }
    return res.status(200).json(jsondata);
}