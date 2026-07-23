'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import GoogleLoginBtn from "../components/googleLoginButton";

export default function Register() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const router = useRouter();

    const registerSend = async (e: FormEvent) => {
        e.preventDefault();
        if (password === confirmPassword) {
            let params = 'email=' + encodeURIComponent(email) + "&password=" + encodeURIComponent(password);
            fetch(apiUrl + 'auth/register', {
                method: "POST",
                cache: 'no-cache',
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                redirect: 'follow', 
                referrerPolicy: 'no-referrer',
                body: params,
            })
            .then(response => response.json()) 
            .then(data => {
                if (data.success) {
                    router.push('/');
                } else {
                    setError(data.message);
                }
            });
        } else {
            setError("Password not match!!!");
            return false;
        }
    };

    return (
        <div className='container'>
            <h2 className="page-title">Please Login Before Chat With US</h2>
            <div className="card">
                <div className="card-body">
                    <form id="registerForm" onSubmit={registerSend}>
                        <h4 className="page-title">Register</h4>
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
                        <div className="mb-3">
                            <label htmlFor="confirmPassword" className="form-label">Password Confirmation</label>
                            <input
                                type="password" 
                                className="form-control" 
                                id="confirmPassword" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        <div className="row">
                            <div className="col-md-4">
                                <button type="submit" className="btn btn-primary" id="registerClick">Register</button> 
                            </div>
                            <div className="col-md-4">
                                <GoogleLoginBtn />
                            </div>
                            <div className="col-md-4">
                                <Link href="/" className="btn btn-warning position-absolute end-0 me-3">Login Page</Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
