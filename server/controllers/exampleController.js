const User = require('../models/user');
const io = require("../socket");
const Socket= require("../socket_with_auth").socket;
const sendEmail = require('../services/mailer');
const sendNotification = require('../services/lineNotification');


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

exports.testNoti = async (req, res) => {
    const message = "test this";
    try {
        const result = await sendNotification(message);
        res.status(200).json({ status: result.status, message: result.message });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.testEmail = async (req, res) => {
    // const { to, subject, text } = req.body;
    const to = "p.kittichet@gmail.com";
    const subject = "Test Email";
    const text = "Node.js Test Email Gmail";

    try {
      const info = await sendEmail(to, subject, text);
      res.status(200).send({ message: 'Email sent successfully', info });
    } catch (error) {
      res.status(500).send({ message: 'Failed to send email', error });
    }
};

