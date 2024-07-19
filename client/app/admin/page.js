'use client'

import React, { useEffect, useState, useRef  } from 'react';
import useSocket from '../service/useSocket';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { converstUTC } from '../service/utility';
import { getUserEmail, getPermission, getToken, logout } from "../service/authorize";
import Swal from 'sweetalert2';
import styles from "./styles.module.css"

export default function Page() {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL;
	const socket = useSocket();
	const [chatId, setChatId] = useState('');
	const [email, setEmail] = useState('');
	const [token, setToken] = useState('');
	const [loading, setLoading] = useState(true);
	const [messages, setMessages] = useState([]);
	const [message, setMessage] = useState('');
	const [socketId, setSocketId] = useState('');
	const [callEmail, setCallEmail] = useState('');
	const [callName, setCallName] = useState('');
	const [chatName, setChatName] = useState('');
    const [customerList, setcustomerList] = useState([]);
	const [activeList, setActiveList] = useState(true);
	const showHideBtn = 
	{
		src: '/images/ham_menu.png',
		alt: 'menu'
	}

	const router = useRouter();
	const endOfPageRef = useRef(null);

	useEffect(() => {
		try {
			const token = getToken();
			if (token !== false) {
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
			const token = getToken();
			const email = getUserEmail();
			setToken(token);
			setEmail(email);
			setChatName("Chat With US");

			// get user list from DB
			fetch(apiUrl+"chat/get_user_list", {
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
				setSocketId(socket.id);
				if(data.result!=""){
					setcustomerList(data.result);
				}
			});

			socket.on('chat:cusList', (newData) => {
				setcustomerList(newData);
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

	const getCustomerChat = (thisEmail, thisName) => {
		setCallEmail(thisEmail);
		setCallName(thisName);
		fetch(apiUrl+"chat/previous_cus?email="+thisEmail+"&socketid="+socketId, {
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
			setChatId(data.result.chatId);
			const allmsg = data.result.chatMessage;
			setChatName(`Chat With ${thisName}`);
			setMessages('');
			for (const key in allmsg) {
				// set message to chat
				setMessages((prevMessages) => [...prevMessages, allmsg[key]]);
			}
			setLoading(false);
		});
	}

	const handleSubmit = (e) => {
		e.preventDefault();
		
		if (socket) {
			// socket.emit('chat:message', { message });
			if(message!=""){
				let formData = new FormData();
				formData.append('email', callEmail);
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

	const archiveClick = () => {
		Swal.fire({
			title: 'Confirm to archive this chat?',
			text: "You can not edit anything after achive.",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#fbd11b',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Confirm'
		}).then((result) => {
			if (result.isConfirmed) {
				let formData = new FormData();
				formData.append('chatId', chatId);
				fetch(apiUrl+"chat/archive_chat", {
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
					if(data.success==1){
						Swal.fire({
							title: "Archive Success.",
							text: 'Chat ID : '+chatId,
							icon: 'success',
							confirmButtonText: 'Close'
						});
						setMessages('');
						setChatId('');
						setCallEmail('');
						setChatName(`Chat With US`);
					}else{
						Swal.fire({
							title: "Can not archive this chat.",
							text: 'Chat ID : '+chatId,
							icon: 'error',
							confirmButtonText: 'Close'
						});
					}

				});

			}
		});
	}

	const showHideListClick = () => {
		const newAct = !activeList;
		setActiveList(newAct);
	}

	const logoutClick = () => {
		logout();
		router.push('/');
	};

	return (
		<div>
			<div className="main-container">
				<button id={chatId?styles.archiveThisChat:styles.hideArchiveThisChat} className="btn btn-warning" onClick={archiveClick}>Archive</button>
				<button id={styles.logoutBtn} className="btn btn-danger" onClick={logoutClick}>Logout</button>
				<Image src={showHideBtn.src} alt={showHideBtn.alt} width={25} height={25} className={styles.hideCustomerChat} onClick={showHideListClick} />
                <div className={(activeList)?styles.customerContainer:styles.customerContainerHide}>
					<h3>Customer List</h3>
                    <ul className={styles.customerList} id="customer-list">
                        {(customerList)?customerList.map((data, index) => (
                            <li key={index} className={styles.customerListItem} data-email={data.email}  onClick={() => getCustomerChat(data.email,data.name)}>
								Chat with {data.name}<br />
								Created At : {converstUTC(data.datetime)}
							</li>
                        )):''}
                    </ul>
                </div>
                <div className={(activeList)?styles.chatContainer:styles.chatContainerFull}>
					<div className='row'>
						<div className='col-md-10'>
							<h2 className="page-title">{chatName}</h2>
						</div>
						<div className='col-md-2'>
							
						</div>
					</div>
                    {/* hideCustomerChat */}
                    <div className="chat-messages">
                        {(messages)?messages.map((data, index) => (
                            <div key={index} className={(data.sender=="admin")?"my-message":"admin-message"}>
                                <p className="meta">{data.name} <span>{converstUTC(data.datetime)}</span></p>
                                <p className="text">{data.data}</p>
                            </div>
                        )):''}
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
	)
}