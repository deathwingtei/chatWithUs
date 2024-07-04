const User = require('../models/user');
const io = require("../socket");
const Socket= require("../socket_with_auth").socket;


exports.testMessage  =  (req, res) => {
    // console.log("Socket Id:", io.getIO().id);
    // console.log(req.body.username);
    // console.log(req.body.message);
    // console.log(req.body.time);
    const jsondata = {
        username:req.body.username,
        message:req.body.message,
        time:req.body.time,
    }
    // send notification to all connected clients
    io.getIO().emit('chat:message', jsondata);
    // io.getIO().emit('chat:message-'+req.body.username, jsondata);

    return res.status(200).json(jsondata);
    // res.send(notify);
}


exports.testMessage2  =  (req, res) => {
    // console.log("Socket Id:", io.getIO().id);
    // console.log(req.body.email);
    // console.log(req.body.message);
    // console.log(req.body.time);
    const jsondata = {
        email:req.body.email,
        message:req.body.message,
        time:req.body.time,
    }
    // send notification to all connected clients
    const soc = Socket.getIo();
    // soc.to(req.user.email).emit("welcome","Event sent from inside of the route");
    soc.to(req.body.email).emit('chat:message', jsondata);
    return res.status(200).json(jsondata);
    // res.send(notify);
}
