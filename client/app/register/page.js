'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link"

export default  function Index() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const registerSend = async (e) => {
        e.preventDefault();
        if(password===confirmPassword){
            let params = 'email='+email+"&password="+password;
            fetch(apiUrl+'auth/register', {
                method: "POST",
                cache: 'no-cache',
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                redirect: 'follow', 
                referrerPolicy: 'no-referrer',
                body: params,
            }).then(response => response.json()) 
            .then(data => {
                if (data.success) {
                    router.push('/');
                } else {
                    setError(data.message);
                }
            });
        }else{
            setError("Password not match!!!");
            return false;
        }
    };
    return(
        <>
            <div className='container'>
                <h2 className="page-title">Please Login Before Chat With US</h2>
                <div className="card" >
                    <div className="card-body">
                        <form id="registerForm" onSubmit={registerSend}>
                            <h4 className="page-title">Register</h4>
                            <div className="mb-3">
                                <label htmlFor="registerEmail" className="form-label">Email address</label>
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
                                <label htmlFor="registerPassword" className="form-label">Password</label>
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
                                <label htmlFor="passwordConfirmation" className="form-label">Password Confirmation</label>
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
                            <button type="submit" className="btn btn-primary" id="registerClick">Register</button> 
                            <Link href="/" aria-current="page" type="button" className="btn btn-warning  position-absolute end-0 me-3">Login Page</Link>
                        </form>
                     </div>
                </div>
            </div>
        </>
    )
}