import React,{useState,useEffect,useCallback,useRef} from 'react';
import { useSocket } from './Socket';
import pc from './pc'; 
import { useParams } from 'react-router-dom';

const Room = () => {

    const socket=useSocket();  
    const {roomId}=useParams(); 
    const [{peer,setOffer,getAnswer,getOffer}]=useState(()=>pc()); 
    const [stream,setStream]=useState();
    const [messages,setMessages]=useState([]); 
    const [text,setText]=useState("");  
    const [remoteStream,setRemoteStream]=useState(); 
    const videoRef=useRef();
    const remoteVideoRef=useRef();
    const streamRef=useRef(); 
    const iceBufferRef=useRef([]); 
    const cancelRef=useRef(); 
    const channelRef=useRef(null);  
    
    const handleJoinClass=useCallback(async()=>{
            streamRef.current.getTracks().forEach((t)=>{
               peer.addTrack(t,streamRef.current); 
           })   
           console.log("joinClass"); 
           const offer=await setOffer(); 
           socket.emit("set-offer",{offer}); 
    },[socket,peer]); 
    const flushIce=async()=>{

      for(const ice of iceBufferRef.current){  
        await peer.addIceCandidate(ice).catch(console.log("err"));  
      }
      iceBufferRef.current=[];  
    }  
    const handleSetOffer=useCallback(async({offer})=>{ 
         console.log("set-offer")
          streamRef.current.getTracks().forEach((t)=>{
            peer.addTrack(t,streamRef.current);  
          })
          const answer=await getOffer(offer); 
          await flushIce(); 
          socket.emit("set-ans",{answer}); 
    },[socket,peer])  
    const handleSetAns=useCallback(async({answer})=>{
         await getAnswer(answer);  
         await flushIce(); 
    },[peer])
    const handleSetIce=useCallback(async({candidate})=>{
        if(peer.remoteDescription){
            await peer.addIceCandidate(candidate).catch(console.log("error"));  
        } 
        else iceBufferRef.current.push(candidate);  
    },[peer]) 
    const handleRoomEmpty=()=>{
       console.log("room is empty"); 
    }
    const handleRoomFull=()=>{
      console.log("room is full"); 
    }
    const setChannel=(channel)=>{
       channelRef.current=channel; 
       channel.onmessage=(ev)=>{
        setMessages((prev)=>[...prev,{from:"them",text:ev.data}]); 
       }
    };
   useEffect(()=>{
    
    cancelRef.current=false; 

      peer.onicecandidate=(ev)=>{ 
            if(ev.candidate) socket.emit("set-ice",{candidate:ev.candidate}); 
          }  
          peer.ontrack=(ev)=>{ 
            setRemoteStream(ev.streams[0]); 
          } 
            setChannel(peer.createDataChannel("chat")); 
          peer.ondatachannel=(ev)=>{  
             setChannel(ev.channel); 
          }

    let start=async()=>{
       try{  
        
      let localStream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
       
      if(cancelRef.current) {localStream.getTracks().forEach((s)=>{s.stop()}); return;}  
      setStream(localStream); 
      streamRef.current=localStream;  

     socket.emit("join-class",{roomId}); 
    socket.on("room-empty",handleRoomEmpty);
    socket.on("room-full",handleRoomFull);  
    socket.on("join-class",handleJoinClass); 
    socket.on("set-offer",handleSetOffer);
    socket.on("set-ans",handleSetAns);
    socket.on("set-ice",handleSetIce); 
    } 
    catch(err){
      console.log(err); 
    }  }
    start();  
    return(()=>{
      cancelRef.current=true;  
    socket.off("join-class",handleJoinClass); 
    socket.off("room-empty",handleRoomEmpty);
    socket.off("room-full",handleRoomFull);  
    socket.off("set-offer",handleSetOffer);
    socket.off("set-ans",handleSetAns);
    socket.off("set-ice",handleSetIce); 
    streamRef.current.getTracks((s)=>s.stop());
    channelRef.current?.close(); 
    channelRef.current=null; 
    peer.close();
    }); 
   },[socket,peer]);     

    useEffect(()=>{
        if(stream && videoRef.current)
        {
             videoRef.current.srcObject=stream; 
        }
    },[stream]);
    useEffect(()=>{
         if(remoteStream && remoteVideoRef.current)
         {
            remoteVideoRef.current.srcObject=remoteStream; 
         }
    },[remoteStream]); 
    const handleSubmit=async(e)=>{
      e.preventDefault(); 
      const ch=channelRef.current; 
      if(!ch || ch.readyState!=="open"|| !text.trim()) return;
      ch.send(text); 
      setMessages((prev=>[...prev,{from:"me",text}]));
      setText(""); 
    }; 
  return (
    <div>
     {stream && <video ref={videoRef} height="200px" width="200px" autoPlay></video>}
     {remoteStream && <video ref={remoteVideoRef} height="200px" width="200px" autoPlay></video>}
      
      <div>
         {messages.map((message,i)=>( 
           message.from=="me"?<div key={i}><p>{message.text}</p></div>
           :<div key={i}><b>{message.text}</b> </div> 
         ))}   
      </div> 
      <form onSubmit={handleSubmit}> 
        <input id="text" type="text" placeholder='write message'
         value={text} 
        onChange={(ev)=>setText(ev.target.value)}></input>
        <button>Submit</button> 
      </form>
    
    </div> 
  )
}

export default Room; 
