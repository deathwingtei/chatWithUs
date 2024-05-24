const socket = require('../app');
const User = require('../models/user');
const io = require("../socket");

exports.testMessage  =  (req, res) => {
    console.log("Socket Id:", io.getIO().id);
    const notify = { data: req.body };
    console.log(notify);
    // send notification to all connected clients
    io.getIO().emit('message', notify);
    res.send(notify);
}