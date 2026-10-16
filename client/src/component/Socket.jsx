import React,{useContext,createContext,useMemo} from 'react';
import { io } from 'socket.io-client';
 

const createSocket=createContext(null);  
 
export const useSocket=()=>{ 
  return useContext(createSocket);  
};

const Socket = (propS) => {
    const socket=useMemo(()=>io("http://localhost:3000"),[]);    
  return ( 
    <createSocket.Provider value={socket}>
      {propS.children}   
    </createSocket.Provider> 
  )
}

export default Socket;
