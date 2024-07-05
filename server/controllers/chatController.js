const User = require('../models/user');
const Chat = require('../models/chat');
const ChatMessage = require('../models/ChatMessage');
const Socket= require("../socket_with_auth").socket;

exports.chatRoom  =  (req, res) => {
    const jsondata = {
        email:req.body.email,
        message:req.body.message,
        time:req.body.time,
    }
    const soc = Socket.getIo();
    soc.to(req.body.email).emit('chat:message', jsondata);
    return res.status(200).json(jsondata);
}

exports.previousChat = (req, res) => {
    const jsondata = {
 
    }
    return res.status(200).json(jsondata);
}