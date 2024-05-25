const User = require('../models/user');
const io = require("../socket");


exports.testMessage  =  (req, res) => {
    // console.log("Socket Id:", io.getIO().id);
    const notify = { data: req.body };
    console.log(req.body.username);
    console.log(req.body.message);
    console.log(req.body.time);
    const jsondata = {
        username:req.body.username,
        message:req.body.message,
        time:req.body.time,
    }
    // send notification to all connected clients
    io.getIO().emit('chat:message', jsondata);
    return res.status(200).json(jsondata);
    // res.send(notify);
}
