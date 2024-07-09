'use client'
import { useState } from 'react';
import Link from "next/link"

export default  function Index() {

    const [state, setState] = useState({
        registerEmail: "",
        registerPassword: "",
        passwordConfirmation: "",
    });

    const registerSend = (e) =>{
    };
    return(
        <>
            <div className='container'>
                <h2 className="page-title">Please Login Before Chat With US</h2>
                <div className="card" >
                    <div className="card-body">
                        <form id="registerForm">
                            <h4 className="page-title">Register</h4>
                            <div className="mb-3">
                                <label htmlFor="registerEmail" className="form-label">Email address</label>
                                <input type="email" className="form-control" id="registerEmail" />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="registerPassword" className="form-label">Password</label>
                                <input type="password" className="form-control" id="registerPassword" />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="passwordConfirmation" className="form-label">Password Confirmation</label>
                                <input type="password" className="form-control" id="passwordConfirmation" />
                            </div>
                            <button type="submit" className="btn btn-primary" id="registerClick">Register</button> 
                            <Link href="/" aria-current="page" type="button" className="btn btn-warning  position-absolute end-0 me-3">Login Page</Link>
                        </form>
                     </div>
                </div>
            </div>
        </>
    )
}