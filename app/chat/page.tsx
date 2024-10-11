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
    const[ftf,setFtf] = useState(false)
    const[onlineCheck,setOnlineCheck] = useState(false)
    const [loading, setLoading] = useState(false);
    const[sending,setSending] = useState(false)

    const user = useSelector((state: RootState) => state.user.username);
    const opposite_person =  useSelector((state: RootState) => state.user.oppositeUsername);

    const chatContainerRef = useRef(null);
    const ftfRef = useRef(ftf);
    const debounceRef = useRef(null);

    useEffect(() => {
      ftfRef.current = ftf; // Update the ref whenever ftf changes
    }, [ftf]);

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

    function makeSeen(){
      axios
          .post('/api/makeSeen', {
            user: user,
            oppositeUser: opposite_person,
          })
          .then((response) => {
            
          })
          .catch((err) => {
            console.log(err.message);
          });
    }

    useEffect(()=>{
        setLoading(true);
        Promise.all([
          makeSeen(),
          getChat(),
        ])
        .then(() => {
          socketInitializer();
        })
        .finally(() => {
          setTimeout(() => {
            setLoading(false);
          }, 1000);
        });
        return () => {
          if (socket) {
              socket.disconnect();
          }
        };
    },[])

    useEffect(()=>{
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    },[chat])

    function socketInitializer(){
      socket = io('https://chatapp-socketio-lhgx.onrender.com/');
  
      socket.emit('register', user);

      socket.emit('faceToFace', {
        opposite_user : opposite_person,
        user: user,
      });

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

      socket.on('faceToFace', (data:any) => {
        if(data.ftf){
          setFtf(true)
        }
        else{
          setFtf(false)
        }
      });

      socket.emit('firstfaceToFace', {
        user: user,
        opposite_user: opposite_person,
      });

      socket.on('firstfaceToFace', (data:any) => {
        if(data.check){
          makeSeen()
          getChat()
        }
      });

      socket.emit('opposite_user_in_ftf', {
        user: user,
        opposite_user: opposite_person,
      });

      socket.emit('onlineCheck', {
        user: user,
        opposite_user: opposite_person,
      });

      socket.on('onlineCheck', (data: any) => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current); // Clear the previous timeout if it exists
        }
  
        debounceRef.current = setTimeout(() => {
          if (data.check) {
            setOnlineCheck(true);
          } else {
            setOnlineCheck(false);
          }
        }, 2000); 
      });
    }

    function sendMessage(e){
      setSending(true)
      e.preventDefault();

      socket.emit('opposite_user_in_ftf', {
        user: user,
        opposite_user: opposite_person,
      });

      const encryptedMessage = CryptoJs.AES.encrypt(recentChat, "mes").toString();
      const postChat = {
          id:0,
          from : user,
          chat : encryptedMessage,
          mTime : '',
          mDate : '',
          seen: ftfRef.current,
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
        })
        .finally(() => {
          setSending(false);
        });
    }
    return(
        <div className="w-full bg-gradient-to-b from-yellow-200 to-white-100  min-h-screen sm:pt-1 p-0">
          
        {
          loading && 
          <div className="loading-container">
            <div className='bg-white flex items-center p-2 px-4'>
              <h2 className='me-2 text-black'>Loading...</h2>
              <div className="spinner"></div>
            </div>
          </div>
        }

            <div className="relative chat-div w-full">
              <div className="sticky top-0 left-0 w-full flex items-center space-x-4 p-4 bg-gray-300 rounded mb-4">
                <div className='flex items-center'>
                    <div className="w-12 h-12 rounded-full overflow-hidden me-2">
                          <Image 
                              src="https://thumbs.dreamstime.com/b/default-avatar-profile-icon-social-media-user-vector-default-avatar-profile-icon-social-media-user-vector-portrait-176194876.jpg" 
                              alt="Profile Avatar"
                              width={48}
                              height={48}
                          />
                    </div>
                    <h2 className="text-lg font-medium text-black">{opposite_person}</h2>
                </div>
                    
                <div className='text-center w-full'>
                  <h5 className={onlineCheck ? 'text-green-500 font-bold bg-white w-1/3 sm:w-1/5 m-auto rounded' : 'text-red-600 font-bold bg-white w-1/3 sm:w-1/5 m-auto rounded'}>{onlineCheck ? 'Online' : 'Offline'}</h5>
                </div>
              </div>
            
                <div className="chat-container z-20" ref={chatContainerRef}>
                    {
                       chat.length !== 0 && 
                          chat.map((item,index) => {
                            const decryptedBytes = CryptoJs.AES.decrypt(item.chat, "mes");
                            const messageContent = decryptedBytes.toString(CryptoJs.enc.Utf8);
                            const isSent = (item.from === user);
                            let diffDate = false;
                            if(index !== 0){
                              if(chat[index-1].mDate !== item.mDate){
                                diffDate = true
                              }
                            }
                            else{
                              diffDate = true
                            }
                            return (
                                <div key={item.id}> 
                                    {
                                      diffDate && 
                                        <div>
                                          <p className='text-center text-black'>{item.mDate}</p>
                                        </div>
                                    }
                                    {
                                        isSent ? 
                                        <div className="w-full flex justify-end items-center w-full">
                                            {/* <small className="text-xs font-light">you</small> */}
                                            <div key={item.id} className='message message-sent ms-2'>
                                                <p className="text-xl text-black font-medium">{messageContent}<small className="text-xs text-black font-light ms-2">{item.mTime}</small></p>
                                            </div>
                                            {
                                              item.seen ?
                                                <p className='text-blue-500'>&#10004;</p>
                                              :
                                                <p className='text-gray-500'>&#10004;</p>
                                            }
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
                        {
                          sending ?
                            <button disabled className="absolute bottom-1 right-2 py-1 px-4 bg-gray-600 text-white font-semibold rounded-full shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition ease-in-out duration-200 w-1/7">Sending...</button>
                          :
                            <button onClick={(e)=>sendMessage(e)} className="absolute bottom-1 right-2 py-1 px-4 bg-green-600 text-white font-semibold rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-200 w-1/7">Send</button>
                        }
                        
                    </div>
                </div>
            </div>
        </div>       
    )
}