'use client'

import React, { useEffect, useState, useRef  } from 'react';
import useSocket from '../service/useSocket';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { converstUTC } from '../service/utility';
import { getUserEmail, getUserName, getPermission, getToken, logout } from "../service/authorize";
import EditProfileModal from '../components/EditProfileModal';
import styles from "./styles.module.css"

export default function Page() {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL;
	const socket = useSocket();
	const [chatId, setChatId] = useState('');
	const [token, setToken] = useState('');
	const [loading, setLoading] = useState(true);
	const [messages, setMessages] = useState([]);
	const [message, setMessage] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [userProfile, setUserProfile] = useState({
		name: '',
		email: '',
	});
	const menuBtn = 
	{
		src: '/images/ham_menu.png',
		alt: 'menu'
	}
	const router = useRouter();
	const endOfPageRef = useRef(null);

	const handleShow = () => setShowModal(true);
	const handleClose = () => setShowModal(false);
  
	const updateUserProfile = (updatedProfile) => {
	  	setUserProfile(updatedProfile);
	};

	useEffect(() => {
		try {
			const token = getToken();
			if (token !== false) {
				const permission = getPermission();
				if (permission === "admin") {
					router.push('/admin');
					return;
				}
			} else {
				logout();
				router.push('/');
				return;
			}
		} catch (error) {
			console.error('Error in useEffect:', error);
			logout();
			router.push('/');
		}
	}, [router]);

	useEffect(() => {
		if (socket) {
			const token = getToken();
			const email = getUserEmail();
			const name = getUserName();
			setUserProfile(
				{
					name:name,
					email:email
				}
			)
			setToken(token);
			fetch(apiUrl+"chat/previous", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`
				},
				cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
				redirect: 'follow', // manual, *follow, error
				referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
			})
			.then(response => response.json())
			.then(data => {
				try {
					if (data.chatId == "" || data.chatId == null) {
						logout();
						router.push('/');
					} else {
						setChatId(data.chatId);
						const allmsg = data.chatMessage;
						for (const key in allmsg) {
							// set message to chat
							setMessages((prevMessages) => [...prevMessages, allmsg[key]]);
						}
					}
				} catch (error) {
					logout();
					router.push('/');
				}
				setLoading(false);
			});

			socket.on('chat:message', (newData) => {
				let returnData = {
					name: newData.name,
					sender: newData.permission,
					datetime: new Date().toLocaleString(),
					data: newData.message
				};
			  	setMessages((prevMessages) => [...prevMessages, returnData]);
				setLoading(false);
			});
		}
	}, [socket]);

	useEffect(() => {
		if (!loading) {
		  endOfPageRef.current?.scrollIntoView({ behavior: 'smooth' });
		}
		setLoading(true);
	}, [loading]);

	const handleSubmit = (e) => {
		e.preventDefault();
		
		if (socket) {
			setLoading(true);
			// socket.emit('chat:message', { message });
			if(message!=""){
				let formData = new FormData();
				formData.append('email', userProfile.email);
				formData.append('chatId', chatId);
				formData.append('message', message);
				formData.append('time', new Date().toLocaleString());
				fetch(apiUrl+"chat", {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`
					},
					cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
					redirect: 'follow', // manual, *follow, error
					referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
					body: formData,
				})
				.then(response => response.json()) 
				.then(data => {
					// no any return default set in socket message
				});
			}
			setMessage('');
		}
	};

	const logoutClick = () => {
		logout();
		router.push('/');
	};

	return (
		<div>
			<div className="customer-chat-container">
				<button id="logout-button"  onClick={logoutClick}>Logout</button>
				{/* <Image src={menuBtn.src} alt={menuBtn.alt} width={25} height={25} className={styles.menuBtn}  onClick={handleShow}  /> */}
				<img src={menuBtn.src} alt={menuBtn.alt} className={styles.menuBtn}  onClick={handleShow} />
				<h2 className="page-title">Chat With US</h2>
				<div className="chat-messages">
					{messages.map((data, index) => (
						<div key={index} className={(data.sender=="admin")?"admin-message":"my-message"}>
							<p className="meta">{data.name} <span>{converstUTC(data.datetime)}</span></p>
							<p className="text">{data.data}</p>
						</div>
					))}
					<div ref={endOfPageRef}></div>
				</div>
				<form className="chat-form" id="form" onSubmit={handleSubmit}>
					<input
						type="text" id="message"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
					/>
					<button type="submit">Send</button>
				</form>
			</div>
			<EditProfileModal
				show={showModal}
				handleClose={handleClose}
				userProfile={userProfile}
				token={token}
				updateUserProfile={updateUserProfile}
			/>
		</div>
	)
}