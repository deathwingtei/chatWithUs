'use client'

import React, { useEffect, useState } from 'react';
import useSocket from '../service/useSocket';
import { useRouter } from 'next/navigation';
import { getUserEmail, getToken, logout } from "../service/authorize";

export default function Page() {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL;
	const socket = useSocket();
	const [chatId, setChatId] = useState('');
	const [email, setEmail] = useState('');
	const [token, setToken] = useState('');
	const [messages, setMessages] = useState([]);
	const [message, setMessage] = useState('');
	const router = useRouter();

	useEffect(() => {
		if (socket) {
			const token = getToken();
			const email = getUserEmail();
			setToken(token);
			setEmail(email);
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
								setMessages((prevMessages) => [...prevMessages, allmsg[key].data]);
							}
						}
					} catch (error) {
						logout();
						router.push('/');
					}
				});

			// socket.on('chat:message', (newMessage) => {
			//   setMessages((prevMessages) => [...prevMessages, newMessage]);
			// });
		}
	}, [socket]);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (socket) {
			// socket.emit('chat:message', { message });
			if(message!=""){
				let formData = new FormData();
				formData.append('email', email);
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
					// console.log(data);
					setMessages((prevMessages) => [...prevMessages, message]);
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
			<h1>Chat Page</h1>
			<button onClick={logoutClick}>Logout</button>
			<form onSubmit={handleSubmit}>
				<input
					type="text"
					value={message}
					onChange={(e) => setMessage(e.target.value)}
				/>
				<button type="submit">Send</button>
			</form>
			<ul>
				{messages.map((msg, index) => (
					<li key={index}>{msg}</li>
				))}
			</ul>
		</div>
	)
}