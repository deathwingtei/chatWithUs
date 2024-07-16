'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { authenticate, getToken, getPermission, logout } from "./service/authorize";
import  GoogleLoginBtn  from "./components/googleLoginButton";

export default function Home() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        // Your DOM manipulation code here
        try {
            if(getToken()!==false){
                if(getPermission()=="user"){
                    router.push('/chat')
                }else{
                    router.push('/admin')
                }
            }
        } catch (error) {
           logout()
        }
    }, []); 

    const sendLogin = async (e) => {
        e.preventDefault();
        let params = 'email='+email+"&password="+password;
        const res = await fetch(apiUrl+'auth/login', {
            method: "POST",
            cache: 'no-cache',
            headers: {
                "Access-Control-Allow-Origin": "*",
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            redirect: 'follow', 
            referrerPolicy: 'no-referrer',
            body: params,
        });
    
        const data = await res.json();
    
        if (data.success) {
            authenticate(data.result, () => {
                if(getPermission()=="user"){
                    router.push('/chat')
                }else{
                    router.push('/admin')
                }
            });
        } else {
            setError(data.message);
        }
    };

    return (
        <div className='container'>
            <h2 className="page-title">Please Login Before Chat With US</h2>
            <div className="card" >
                <div className="card-body">
                    <form id="loginForm"  onSubmit={sendLogin}>
                        <h4 className="page-title">Login</h4>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email address</label>
                            <input 
                                type="email" 
                                className="form-control" 
                                id="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input 
                                type="password" 
                                className="form-control" 
                                id="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        <div className="row">
                            <div className="col-md-4">
                                <button type="submit" className="btn btn-primary" id="loginClick">Login</button> 
                            </div>
                            <div className="col-md-4">
                                <GoogleLoginBtn />
                            </div>
                            <div className="col-md-4">
                                <Link href="register" aria-current="page" type="button" className="btn btn-warning position-absolute end-0 me-3">Register Page</Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}