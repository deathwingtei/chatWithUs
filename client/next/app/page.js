'use client'

import React, {useState} from 'react';
import {io} from 'socket.io-client';
const socket = io("http://localhost:8080",{transports:['websocket']});
export default function Home() {
  const [name,setName] = useState("");
  const [id,setId] = useState("");
  const [message,setMessage] = useState([]);
  const handlepost = (e) =>{
    console.log(name)
    socket.emit("message",{post:name});
  };
  
  // socket.on("your id",data => {
  //   setId(data);
  // });
  socket.on("message",data => {
    setMessage([...message,data]);
  });
  return (
    <div>
      <input type="text" onChange={(e)=> setName(e.target.value)} /> 
      <button onClick={handlepost}>Send massage </button>
      <p>Recive message {id}</p>
      {message.map((p,index)=>(
        <li key={index}>{p}</li>
      ))}
    </div>
  )
}