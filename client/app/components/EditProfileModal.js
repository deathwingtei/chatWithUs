'use client'

import { useEffect,useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';

const EditProfileModal = ({ show, handleClose, userProfile, token, updateUserProfile }) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (userProfile) {
            setFormData({
                name: userProfile.name || '',
                email: userProfile.email || '',
                newPassword: '',
                confirmPassword: ''
            });
        }
    }, [userProfile]);
    

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // update to db node.js
        // apiUrl+"auth/profile/update
        updateUserProfile(formData);
        handleClose();
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
        // update to db node.js
        if(formData.newPassword&&formData.confirmPassword&&formData.confirmPassword===formData.newPassword){
            let formData = new FormData();
            formData.append('password', formData.newPassword);
            fetch(apiUrl+"auth/password/update", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                cache: 'no-cache',
                redirect: 'follow',
                referrerPolicy: 'no-referrer',
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setShowPassword(false);
            });
            setShowPassword(false);
        }else{
            Swal.fire({
                title: "Password nor match.",
                icon: 'error',
                confirmButtonText: 'Close'
            });
        }

    };

	const [showPassword, setShowPassword] = useState(false);

    const swapChangePassword  = () => {
        setShowPassword(!showPassword);
        setFormData(
            {
                name: userProfile.name,
                email: userProfile.email,
                newPassword: '',
                confirmPassword: ''
            }
        );
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Profile</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                { showPassword===false ? 
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formEmail" className="mt-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    { showPassword===false ? 
                        <Form.Group  className="mt-3" >
                            <Button variant="info" onClick={swapChangePassword}>
                                Change Password
                            </Button>
                        </Form.Group>
                    : '' }
                    <Button variant="primary" type="submit" className="mt-3">
                        Save Changes
                    </Button>
                </Form>
                :  
                <Form onSubmit={handleChangePassword}>
                        <Form.Group controlId="newPassword">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="confirmPassword" className="mt-3">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Button variant="success" type="submit" className="mt-3">
                            Save Changes Password
                        </Button>
                        <Button variant="danger" type="button" className="mt-3 ms-3"  onClick={swapChangePassword}>
                            Cancel
                        </Button>
                    </Form>
                }
            </Modal.Body>
        </Modal>
    );
};

export default EditProfileModal;