import express from "express";
import {Server} from "socket.io";
import {createServer} from "http"; 

const app=express(); 

let server=createServer(app);
let io=new Server(server,{
    cors:{
          origin:"*"
    }
}); 

io.on("connection",(socket)=>{

     socket.on("join-room",({roomId})=>{
         
        socket.emit("join-room",{roomId}); 
     })     
     socket.on("join-class",({roomId})=>{
          
       let roomNum=io.sockets.adapter.rooms.get(roomId)?.size??0;
     
       if(roomNum==2) {socket.emit("room-full"); return;}
        
       socket.data.room=roomId;
       socket.join(roomId);
       
       if(roomNum==0) {socket.emit("room-empty"); return;}
       
       socket.emit("join-class"); 
     });
     ["set-offer","set-ans","set-ice"].forEach((element) => {
        
        socket.on(element,(payload)=>{
           
            let id=socket.data.room; 
           socket.to(id).emit(element,payload); 
        });
     });

      socket.on("disconnect",()=>{
          console.log("disconnect"); 
     })
})

server.listen(3000); 