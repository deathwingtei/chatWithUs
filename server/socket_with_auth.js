const socket = require("socket.io").Server;
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
            socket['email'] = socket.handshake.auth.email;
            next();
        })

        io.on("connection", (socket) => {
        
            socket.join(socket.email);


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