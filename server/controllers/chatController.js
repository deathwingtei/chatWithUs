const User = require('../models/user');
const Chat = require('../models/chat');
const ChatMessage = require('../models/ChatMessage');
const Socket= require("../socket_with_auth").socket;
const jsonwebtoken = require("jsonwebtoken");

exports.chatRoom  =  (req, res) => {
    const message = req.body.message
    const time = req.body.time;
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
                return res.status(401).json({ status: 401, success: 0, result: "", message: "No email auth" });
            });
        }
    });


}

exports.previousChat = (req, res) => {
    const jsondata = {
 
    }
    return res.status(200).json(jsondata);
}


exports.adminChatRoom = (req, res) => {
    const jsondata = {
 
    }
    return res.status(200).json(jsondata);
}