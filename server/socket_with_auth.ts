import { Server as SocketIOServer, Socket as IOSocket } from "socket.io";
import jsonwebtoken from "jsonwebtoken";
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

export interface CustomSocket extends IOSocket {
    token?: string;
    email?: string;
    user_id?: string;
}

class Socket {
    #server: HTTPServer | null = null;

    setServer(server: HTTPServer) {
        this.#server = server;
    }

    createConnection() {
        if (!this.#server) return;
        io = new SocketIOServer(this.#server, { cors: { origin: '*' } });
        
        io.use((socket: CustomSocket, next) => {
            try {
                const token = socket.handshake.query.token as string;
                const email = socket.handshake.query.email as string;
                socket.token = token;
                socket.email = email;
                const secret = process.env.JWT_SECRET || '';
                const decoded = jsonwebtoken.verify(token, secret) as any;
                const userData = decoded.signData.split("_");
                socket.user_id = userData[0];
                next();
            } catch (error) {
                console.log(error);
                next();
            }
        });

        io.on("connection", (socket: CustomSocket) => {
            if (socket.email) {
                socket.join(socket.email);
            }
            socket.on("disconnect", (reason) => {
                // any custom code when socket gets disconnected
            });
        });
    }

    getIo(): SocketIOServer | null {
        return io;
    }

    updateSocketEmailAndJoinRoom(socketId: string, newEmail: string) {
        if (!io) return;
        const socket = io.sockets.sockets.get(socketId) as CustomSocket | undefined;
        if (socket) {
            socket.rooms.forEach((room) => {
                socket.leave(room);
            });
            socket.email = newEmail;
            socket.join(newEmail);
        }
    }
}

export const socket = new Socket();
