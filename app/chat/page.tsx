"use client"
import React from 'react';
import Image from "next/image";
import { RootState } from '../../redux/store';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import axios from 'axios';
import { useEffect , useRef } from 'react';
import io from 'socket.io-client';
import CryptoJs from "crypto-js"

let socket;

export default function Chat() {
    const[chat,setChat] = useState([]);
    const[recentChat,setRecentChat] = useState("")
    const user = useSelector((state: RootState) => state.user.username);
    const opposite_person =  useSelector((state: RootState) => state.user.oppositeUsername);
    
    const chatContainerRef = useRef(null);

    function getChat(){
      axios
        .get("/api/chat", {
            params: { user: user,opposite_person:opposite_person },
          })
        .then((response) => {
          if(response.data.status === true){
            setChat(response.data.chat)
          }
        })
        .catch((err) => {
          console.log(err.message);
        });
    }

    useEffect(()=>{
        getChat();
        socketInitializer();
    },[])

    useEffect(()=>{
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    },[chat])

    function socketInitializer(){
      socket = io('https://chatapp-socketio-lhgx.onrender.com/');
  
      socket.emit('register', user);
  
      socket.on('notification', (data:any) => {
        if(data.message.includes("Your request has been accepted by") || data.message.includes("You has been removed from friend list by")){
          alert(data.message)
        }
        else if(data.for === "new chat"){
          getChat();
          if(data.from !== opposite_person){
            alert(data.from +' : '+ data.message)
          }
        }
      });
    }

    function sendMessage(e){
      e.preventDefault();
      const encryptedMessage = CryptoJs.AES.encrypt(recentChat, "mes").toString();
      const postChat = {
          id:0,
          from : user,
          chat : encryptedMessage,
          mTime : '',
          mDate : ''
      }

      axios
        .post('/api/chat',{user:user,oppositeUser:opposite_person,chat:postChat})
        .then((response) => {
          if(response.data.status === true){

            socket.emit('chat', {
              recipient: opposite_person,
              currentUser: user,
              message:recentChat
            });

            getChat();
            setRecentChat("")
          }
        })
        .catch((err) => {
          console.log(err.message);
      });
    }
    return(
        <div className="w-full bg-gradient-to-b from-yellow-200 to-white-100  min-h-screen sm:pt-1 p-0">
            <div className="relative chat-div w-full">
                <div className="sticky z-50 top-0 left-0 w-full flex items-center space-x-4 p-4 bg-gray-300 rounded mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                        <Image 
                            src="https://thumbs.dreamstime.com/b/default-avatar-profile-icon-social-media-user-vector-default-avatar-profile-icon-social-media-user-vector-portrait-176194876.jpg" 
                            alt="Profile Avatar"
                            width={48}
                            height={48}
                        />
                    </div>
                    <h2 className="text-lg text-black font-medium">{opposite_person}</h2>
                </div>
            
                <div className="chat-container z-20" ref={chatContainerRef}>
                    {
                       chat.length !== 0 && 
                          chat.map((item) => {
                            const decryptedBytes = CryptoJs.AES.decrypt(item.chat, "mes");
                            const messageContent = decryptedBytes.toString(CryptoJs.enc.Utf8);
                            const isSent = (item.from === user);
                            return (
                                <div key={item.id}> 
                                    {
                                        isSent ? 
                                        <div className="w-full flex justify-end items-center w-full">
                                            {/* <small className="text-xs font-light">you</small> */}
                                            <div key={item.id} className='message message-sent ms-2'>
                                                <p className="text-xl text-black font-medium">{messageContent}<small className="text-xs text-black font-light ms-2">{item.mTime}</small></p>
                                            </div>
                                        </div>
                                        :
                                        <div className="w-full flex justify-start items-center">
                                            <div key={item.id} className='message message-received  ms-2'>
                                                <p className="text-xl text-black font-medium">{messageContent}<small className="text-xs text-black font-light ms-2">{item.mTime}</small></p>
                                            </div>
                                            {/* <small className="text-xs font-light ms-2">{opposite_person}</small> */}
                                        </div>
                                    }
                                </div>
                            );
                        })
                    }
                </div>
                <div className="sticky z-50 bottom-0 w-full shadow">
                    <div className="relative">
                        <input onChange={(e)=>setRecentChat(e.target.value)} value={recentChat} placeholder="Type you message" className="w-full rounded-full border-2 p-2 text-black"/>
                        <button onClick={(e)=>sendMessage(e)} className="absolute bottom-1 right-2 py-1 px-4 bg-green-600 text-white font-semibold rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-200 w-1/7">Send</button>
                    </div>
                </div>
            </div>
        </div>       
    )
}