'use client'

import React, { useEffect, useState, useRef, FormEvent } from 'react';
import useSocket from '../service/useSocket';
import { useRouter } from 'next/navigation';
import { converstUTC } from '../service/utility';
import { getUserEmail, getPermission, getToken, logout } from "../service/authorize";
import Swal from 'sweetalert2';
import styles from "./styles.module.css";

interface CustomerItem {
	email: string;
	name: string;
	datetime: string;
}

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
	const [email, setEmail] = useState<string>('');
	const [token, setToken] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(true);
	const [messages, setMessages] = useState<ChatMessageItem[]>([]);
	const [message, setMessage] = useState<string>('');
	const [socketId, setSocketId] = useState<string>('');
	const [callEmail, setCallEmail] = useState<string>('');
	const [callName, setCallName] = useState<string>('');
	const [chatName, setChatName] = useState<string>('');
    const [customerList, setCustomerList] = useState<CustomerItem[]>([]);
	const [activeList, setActiveList] = useState<boolean>(true);
	const showHideBtn = {
		src: '/images/ham_menu.png',
		alt: 'menu'
	};

	const router = useRouter();
	const endOfPageRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		try {
			const currentToken = getToken();
			if (currentToken !== false) {
				const permission = getPermission();
				if (permission === "user") {
					router.push('/chat');
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
			const userEmail = getUserEmail() || '';
			setToken(currentToken);
			setEmail(userEmail);
			setChatName("Chat With US");

			fetch(apiUrl + "chat/get_user_list", {
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
				if (socket.id) {
					setSocketId(socket.id);
				}
				if (data.result && data.result !== "") {
					setCustomerList(data.result);
				}
			});

			socket.on('chat:cusList', (newData: CustomerItem[]) => {
				setCustomerList(newData);
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
	}, [socket, apiUrl]);

	useEffect(() => {
		if (!loading) {
		  endOfPageRef.current?.scrollIntoView({ behavior: 'smooth' });
		}
		setLoading(true);
	}, [loading]);

	const getCustomerChat = (thisEmail: string, thisName: string) => {
		setCallEmail(thisEmail);
		setCallName(thisName);
		fetch(apiUrl + "chat/previous_cus?email=" + encodeURIComponent(thisEmail) + "&socketid=" + socketId, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`
			},
			cache: 'no-cache',
			redirect: 'follow',
			referrerPolicy: 'no-referrer',
		})
		.then(response => response.json()) 
		.then(data => {
			setChatId(data.result.chatId);
			const allmsg = data.result.chatMessage;
			setChatName(`Chat With ${thisName}`);
			setMessages([]);
			for (const key in allmsg) {
				setMessages((prevMessages) => [...prevMessages, allmsg[key]]);
			}
			setLoading(false);
		});
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		
		if (socket) {
			if (message !== "") {
				let formData = new FormData();
				formData.append('email', callEmail);
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
					// socket event will append
				});
			}
			setMessage('');
		}
	};

	const archiveClick = () => {
		Swal.fire({
			title: 'Confirm to archive this chat?',
			text: "You can not edit anything after archive.",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#fbd11b',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Confirm'
		}).then((result) => {
			if (result.isConfirmed) {
				let formData = new FormData();
				formData.append('chatId', chatId);
				fetch(apiUrl + "chat/archive_chat", {
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
					if (data.success === 1) {
						Swal.fire({
							title: "Archive Success.",
							text: 'Chat ID : ' + chatId,
							icon: 'success',
							confirmButtonText: 'Close'
						});
						setMessages([]);
						setChatId('');
						setCallEmail('');
						setChatName(`Chat With US`);
					} else {
						Swal.fire({
							title: "Can not archive this chat.",
							text: 'Chat ID : ' + chatId,
							icon: 'error',
							confirmButtonText: 'Close'
						});
					}
				});
			}
		});
	};

	const showHideListClick = () => {
		setActiveList(!activeList);
	};

	const logoutClick = () => {
		logout();
		router.push('/');
	};

	return (
		<div>
			<div className="main-container">
				<button id={chatId ? styles.archiveThisChat : styles.hideArchiveThisChat} className="btn btn-warning" onClick={archiveClick}>Archive</button>
				<button id={styles.logoutBtn} className="btn btn-danger" onClick={logoutClick}>Logout</button>
				<img src={showHideBtn.src} alt={showHideBtn.alt} className={styles.hideCustomerChat} onClick={showHideListClick} />
                <div className={activeList ? styles.customerContainer : styles.customerContainerHide}>
					<h3>Customer List</h3>
                    <ul className={styles.customerList} id="customer-list">
                        {customerList ? customerList.map((data, index) => (
                            <li key={index} className={styles.customerListItem} data-email={data.email} onClick={() => getCustomerChat(data.email, data.name)}>
								Chat with {data.name}<br />
								Created At : {converstUTC(data.datetime)}
							</li>
                        )) : ''}
                    </ul>
                </div>
                <div className={activeList ? styles.chatContainer : styles.chatContainerFull}>
					<div className='row'>
						<div className='col-md-10'>
							<h2 className="page-title">{chatName}</h2>
						</div>
						<div className='col-md-2'></div>
					</div>
                    <div className="chat-messages">
                        {messages ? messages.map((data, index) => (
                            <div key={index} className={(data.sender === "admin") ? "my-message" : "admin-message"}>
                                <p className="meta">{data.name} <span>{converstUTC(data.datetime)}</span></p>
                                <p className="text">{data.data}</p>
                            </div>
                        )) : ''}
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
            </div>
		</div>
	);
}
