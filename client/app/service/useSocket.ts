import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { getUserEmail, getToken } from "./authorize";

const useSocket = (): Socket | null => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const userEmail = getUserEmail();
        const userToken = getToken();
        if (userEmail && userToken) {
            const socketInstance = io(apiUrl, { transports: ['websocket'], query: { token: userToken, email: userEmail } });
            setSocket(socketInstance);

            // Clean up on unmount
            return () => {
                socketInstance.disconnect();
            };
        }
    }, [apiUrl]);

    return socket;
};

export default useSocket;
