'use client';

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from 'next/navigation';
import { auth } from "./googleAuth";
import { authenticate, getPermission } from "../service/authorize";

declare global {
  interface Window {
    google?: any;
  }
}

const GoogleLoginBtn: React.FC = () => {
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const authUrl = apiUrl + 'auth/google';
    const [initialized, setInitialized] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGoogle = async (response: any) => {
        try {
            const data = await auth.handleGoogle({
                credential: response.credential,
                endpoint: authUrl,
            });
            if (data) {
                if (data.success) {
                    authenticate(data.result, () => {
                        if (getPermission() === "user") {
                            router.push('/chat');
                        } else {
                            router.push('/admin');
                        }
                    });
                } else {
                    setError(data.message);
                }
                router.push("/chat");
            } else {
                alert("Login failed");
            }
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    useEffect(() => {
        if (initialized) return;
        const initializeGoogle = () => {
            if (window.google && !initialized) {
                window.google.accounts.id.initialize({
                    client_id: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
                    callback: handleGoogle,
                });

                window.google.accounts.id.renderButton(
                    document.getElementById("google-login-btn"),
                    {
                        type: "standard",
                        theme: "filled_blue",
                        size: "large",
                        text: "signin_with",
                        shape: "rectangular",
                    }
                );

                window.google.accounts.id.prompt();
                setInitialized(true);
            }
        };

        if (window.google) {
            initializeGoogle();
        } else {
            const interval = setInterval(() => {
                if (window.google) {
                    clearInterval(interval);
                    initializeGoogle();
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [initialized]);

    return (
        <>
            <div id="google-login-btn"></div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <Script src="https://accounts.google.com/gsi/client" async defer></Script>
        </>
    );
};

export default GoogleLoginBtn;
