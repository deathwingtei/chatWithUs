'use client'

import React, { useEffect, useState, useRef, FormEvent } from 'react';
import useSocket from '../service/useSocket';
import { useRouter } from 'next/navigation';
import { converstUTC } from '../service/utility';
import { getUserEmail, getUserName, getPermission, getToken, logout } from "../service/authorize";
import EditProfileModal, { UserProfile } from '../components/EditProfileModal';
import styles from "./styles.module.css";

interface ChatMessageItem {
    name: string;
    sender: string;
    datetime: string;
    data: string;
}

export default function Page() {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
	const socket = useSocket();
	const [chatId, setChatId] = useState<string>('');
	const [token, setToken] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(true);
	const [messages, setMessages] = useState<ChatMessageItem[]>([]);
	const [message, setMessage] = useState<string>('');
	const [showModal, setShowModal] = useState<boolean>(false);
	const [userProfile, setUserProfile] = useState<UserProfile>({
		name: '',
		email: '',
	});
	const menuBtn = {
		src: '/images/ham_menu.png',
		alt: 'menu'
	};
	const router = useRouter();
	const endOfPageRef = useRef<HTMLDivElement | null>(null);

	const handleShow = () => setShowModal(true);
	const handleClose = () => setShowModal(false);
  
	const updateUserProfile = (updatedProfile: UserProfile) => {
	  	setUserProfile(updatedProfile);
	};

	useEffect(() => {
		try {
			const currentToken = getToken();
			if (currentToken !== false) {
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
			const currentToken = getToken() || '';
			const email = getUserEmail() || '';
			const name = getUserName() || '';
			setUserProfile({ name, email });
			setToken(currentToken);
			fetch(apiUrl + "chat/previous", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${currentToken}`
				},
				cache: 'no-cache',
				redirect: 'follow',
				referrerPolicy: 'no-referrer',
			})
			.then(response => response.json())
			.then(data => {
				try {
					if (!data.chatId) {
						logout();
						router.push('/');
					} else {
						setChatId(data.chatId);
						const allmsg = data.chatMessage;
						for (const key in allmsg) {
							setMessages((prevMessages) => [...prevMessages, allmsg[key]]);
						}
					}
				} catch (error) {
					logout();
					router.push('/');
				}
				setLoading(false);
			});

			socket.on('chat:message', (newData: any) => {
				let returnData: ChatMessageItem = {
					name: newData.name,
					sender: newData.permission,
					datetime: new Date().toLocaleString(),
					data: newData.message
				};
			  	setMessages((prevMessages) => [...prevMessages, returnData]);
				setLoading(false);
			});
		}
	}, [socket, apiUrl, router]);

	useEffect(() => {
		if (!loading) {
		  endOfPageRef.current?.scrollIntoView({ behavior: 'smooth' });
		}
		setLoading(true);
	}, [loading]);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		
		if (socket) {
			setLoading(true);
			if (message !== "") {
				let formData = new FormData();
				formData.append('email', userProfile.email);
				formData.append('chatId', chatId);
				formData.append('message', message);
				formData.append('time', new Date().toLocaleString());
				fetch(apiUrl + "chat", {
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
				.then(() => {
					// socket event will append message
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
				<button id="logout-button" onClick={logoutClick}>Logout</button>
				<img src={menuBtn.src} alt={menuBtn.alt} className={styles.menuBtn} onClick={handleShow} />
				<h2 className="page-title">Chat With US</h2>
				<div className="chat-messages">
					{messages.map((data, index) => (
						<div key={index} className={(data.sender === "admin") ? "admin-message" : "my-message"}>
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
	);
}
