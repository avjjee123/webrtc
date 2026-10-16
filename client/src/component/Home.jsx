import React from 'react'
import { useSocket } from './Socket';
import { useEffect,useState } from 'react';
import { useNavigate } from 'react-router-dom';
const Home = () => {

  const [roomId,setRoomId]=useState(""); 

  const socket=useSocket();
  const navigate=useNavigate(); 

  const handleJoin=({roomId})=>{
    console.log("handlejoin");
     navigate(`/room/${roomId}`);  
  }
   
  useEffect(()=>{ 

     socket.on("join-room",handleJoin);

     return(()=>{
      socket.off("join-room",handleJoin); 
     })
    },[socket]); 

  const handleSubmit=(e)=>{
    e.preventDefault();    
    socket.emit("join-room",{roomId});  
  } 
  return (
    <div>
      <form onSubmit={handleSubmit}> 
        <input id="roomId" type="text" 
        onChange={(e)=>setRoomId(e.target.value)}></input>
        <label htmlFor="roomId">Room Id</label>
        <br></br>
        <button>Submit</button>
      </form>   
    </div> 
  )
}

export default Home 
