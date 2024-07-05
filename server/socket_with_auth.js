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
            socket['token'] = socket.handshake.query.token;
            // socket['email'] = "p.kittichet@gmail.com";
            const userData = jsonwebtoken.verify(socket.token,  process.env.JWT_SECRET).signData.split("_");
            socket['id'] = userData[0];
            socket['email'] = userData[1];
            next();
        })

        io.on("connection", (socket) => {
            socket.join(socket.email);
            console.log(`New connection: ${socket.id}`);
            socket.on("disconnect", (reason) => {
                // any custom code when socket gets disconnected;
            });
        });

    }

    getIo(){
        return io;
    }
}

module.exports.socket = new Socket();