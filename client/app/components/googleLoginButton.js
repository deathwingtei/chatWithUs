// Source https://medium.com/designly/create-a-google-login-button-with-no-dependencies-in-react-next-js-7f0f025cd4b1

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from 'next/navigation';
import { auth } from "./googleAuth"; // Import the auth object

const GoogleLoginBtn = () => {
    const router = useRouter();
    const authUrl = process.env.NEXT_PUBLIC_API_URL+ 'auth/google';
    const [initialized, setInitialized] = useState(false);

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
        if (initialized) return;
        // We check every 300ms to see if google client is loaded
        const initializeGoogle = () => {
            if (window.google && !initialized) {
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
                setInitialized(true);
            }
        };

        if (window.google) {
            initializeGoogle();
          } else {
            // If google is not loaded, set an interval to check for it
            const interval = setInterval(() => {
              if (window.google) {
                clearInterval(interval);
                initializeGoogle();
              }
            }, 1000);
            return () => clearInterval(interval); // Clean up the interval on unmount
        }
    }, [initialized]); //eslint-disable-line

    return (
        <>
            <div id="google-login-btn"></div>
            <Script src="https://accounts.google.com/gsi/client" async defer></Script>
        </>
    );
};

export default GoogleLoginBtn;