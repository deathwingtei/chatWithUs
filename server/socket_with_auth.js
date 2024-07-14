// Source https://javascript.plainenglish.io/how-to-emit-socket-events-from-the-routes-in-nodejs-0f5703cf655f
const socket = require("socket.io").Server;
const jsonwebtoken = require("jsonwebtoken");
let io = null;

class Socket{

    #server;

    setServer(server){
        this.#server = server; //storing server details as class property
    }

    createConnection(){
        io = new socket(this.#server,{cors:true}); // setting up socket connection
        //just a basic middleware stoirng a key email with the
        // value passed by the client while making connection.
        io.use((socket,next)=>{
            try {
                socket['token'] = socket.handshake.query.token;
                socket['email'] = socket.handshake.query.email;
                const userData = jsonwebtoken.verify(socket.token,  process.env.JWT_SECRET).signData.split("_");
                socket['user_id'] = userData[0];
                // console.log(socket.id);
                // socket['email'] = socket.handshake.query.email;
                next();
            } catch (error) {
                console.log(error);
            }
        })

        io.on("connection", (socket) => {
            socket.join(socket.email);
            // console.log(`New connection: ${socket.id}`);
            socket.on("disconnect", (reason) => {
                // any custom code when socket gets disconnected;
            });
        });

    }

    getIo(){
        return io;
    }

    updateSocketEmailAndJoinRoom(socketId, newEmail) {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
            socket.rooms.forEach((room) => {
                socket.leave(room);
            });
            socket.email = newEmail;
            socket.join(newEmail);
        }
    }
}

module.exports.socket = new Socket();