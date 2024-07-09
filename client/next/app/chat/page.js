'use client'

import React, {useState} from 'react';
import {io} from 'socket.io-client';
const socket = io("http://localhost:8081",{transports:['websocket']});
export default function Home() {
  const [sendData,setSendData] = useState("");
  const [id,setId] = useState("");
  const [message,setMessage] = useState([]);
  const handlepost = (e) =>{
    e.preventDefault();
    // socket.emit("message",{post:name});
    setSendData("");

    let formData = new FormData();
    formData.append('username', "test");
    formData.append('message', sendData);
    formData.append('time', new Date().toLocaleTimeString());
    fetch("http://localhost:8081/example", {
        method: "POST",
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: formData,
    })
    .then(response => response.json()) 
    .then(data => {
        socket.emit('chat:message', data);

    });

  };
  
  // socket.on("your id",data => {
  //   setId(data);
  // });
  socket.on("chat:message",data => {
    setMessage([...message,data.message]);
  });
  return (
    <div>
      <input type="text" value={sendData} onChange={(e)=> setSendData(e.target.value)} /> 
      <button onClick={handlepost}>Send massage </button>
      <p>Recive message {id}</p>
      {message.map((p,index)=>(
        <li key={index}>{p}</li>
      ))}
    </div>
  )
}