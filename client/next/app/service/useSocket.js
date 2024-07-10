import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { getUserEmail, getToken } from "./authorize";

const useSocket = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const userEmail = getUserEmail();
        const userToken = getToken();
        if (userEmail && userToken) {
            const socket = io(apiUrl, { transports: ['websocket'], query: { token: userToken, email: userEmail } });
            setSocket(socket);

            // Clean up on unmount
            return () => socket.disconnect();
        }
    }, []);

    return socket;
};

export default useSocket;