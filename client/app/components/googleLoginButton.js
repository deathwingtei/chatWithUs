// Source https://medium.com/designly/create-a-google-login-button-with-no-dependencies-in-react-next-js-7f0f025cd4b1

import React, { useEffect } from "react";
import Script from "next/script";
import { useRouter } from 'next/navigation';
import { auth } from "./googleAuth"; // Import the auth object

const GoogleLoginBtn = () => {
    const router = useRouter();
    const authUrl = process.env.NEXT_PUBLIC_API_URL+ 'auth/google';

    // Google will pass the login credential to this handler
    const handleGoogle = async (response) => {
        try {
        const result = await auth.handleGoogle({
            credential: response.credential,
            endpoint: authUrl,
        });
        if (result) {
            router.push("/chat");
        } else {
            alert("Login failed");
        }
        } catch (err) {
        alert(`Error: ${err.message}`);
        }
    };

    useEffect(() => {
        // We check every 300ms to see if google client is loaded
        const interval = setInterval(() => {
            if (window.google) {
                clearInterval(interval);
                google.accounts.id.initialize({
                    client_id: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID, // Your client ID from Google Cloud
                    callback: handleGoogle, // Handler to process login token
                });

                // Render the Google button
                google.accounts.id.renderButton(
                    document.getElementById("google-login-btn"),
                    {
                        type: "standard",
                        theme: "filled_blue",
                        size: "large",
                        text: "signin_with",
                        shape: "rectangular",
                    }
                );

                google.accounts.id.prompt();
            }
        }, 300);
    }, []); //eslint-disable-line

    return (
        <>
            <div id="google-login-btn"></div>
            <Script src="https://accounts.google.com/gsi/client" async defer></Script>
        </>
    );
};

export default GoogleLoginBtn;