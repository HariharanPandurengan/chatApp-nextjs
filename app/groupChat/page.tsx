"use client"

import React, { useEffect , useState , useRef } from 'react';
import { RootState } from '../../redux/store';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import io from 'socket.io-client';
import Image from "next/image";

let socket;

export default function GroupChat() {

    const router = useRouter();

    const[chatList,setChatList] = useState([]);
    const[recentChat,setRecentChat] = useState("");
    const[groupMembers,setGroupMembers] = useState([])
    const[info,setInfo] = useState([])

    const groupID = useSelector((state: RootState) => state.user.groupID);
    const groupName = useSelector((state: RootState) => state.user.groupName);
    const user = useSelector((state: RootState) => state.user.username);

    const chatContainerRef = useRef(null);

    useEffect(()=>{
        getChat();
        socketInitializer();
    },[])

    useEffect(()=>{
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    },[chatList])

    function socketInitializer(){
        socket = io('https://chatapp-socketio-lhgx.onrender.com/');
    
        socket.emit('register', user);
    
        socket.on('notification', (data:any) => {
          if(data.message.includes("Your request has been accepted by") || data.message.includes("You has been removed from friend list by")){
            alert(data.message)
          }
          else if(data.for === "new chat"){
            // getChat();
          }
          else if(data.for === "group chat"){
            getChat();
          }
        });
    }

    function getChat(){
        axios
        .get("/api/getGroupChat", {
        params: { groupID: groupID , groupName:groupName},
        })
        .then((response) => {
            setChatList(response.data.group.chat);

            const arr = [];
            arr.push(...response.data.group.members.filter(item => item !== user));
            arr.push(...response.data.group.admin.filter(item => item !== user));
            setGroupMembers(arr)
        })
        .catch((err) => {
        console.log(err.message);
        });
    }

    function sendMessage(e){
        e.preventDefault();
        const postChat = {
            id:0,
            from : user,
            chat : recentChat,
            mTime : '',
            mDate : ''
        }
  
        axios
          .post('/api/getGroupChat',{groupInfo : {groupID:groupID,groupName:groupName,chat:postChat}})
          .then((response) => {
            if(response.data.status === true){
  
              socket.emit('group_chat', {
                groupID: groupID,
                groupName:groupName,
                recipients:groupMembers,
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

    function deleteGroup(e){
        e.preventDefault();
        axios
          .post('/api/getGroupChat',{groupInfo : {groupID:groupID,groupName:groupName,members:groupMembers,currentUser:user}})
          .then((response) => {
            if(response.data.status === true){
                router.push("chat-list")
            }
          })
          .catch((err) => {
            console.log(err.message);
        });
    }

    return(
        <div className="w-full bg-gradient-to-b from-yellow-200 to-white-100  min-h-screen pt-1">
            <div className="relative chat-div">
                <div className="sticky top-0 left-0 w-full flex items-center space-x-4 p-4 bg-gray-300 rounded mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                        <Image 
                            src="https://png.pngtree.com/png-vector/20191009/ourmid/pngtree-group-icon-png-image_1796653.jpg" 
                            alt="Profile Avatar"
                            width={48}
                            height={48}
                        />
                    </div>
                    <h2 className="text-lg font-medium">{groupName}</h2>
                </div>
            
                <div className="chat-container" ref={chatContainerRef}>
                    {
                       chatList.length !== 0 && 
                       chatList.map((item) => {
                            const messageContent = item.chat;
                            const isSent = (item.from === user);
                            return (
                                <div key={item.id}> 
                                    {
                                        isSent ? 
                                        <div className="w-full flex justify-end items-center">
                                            {/* <small className="text-xs font-light">you</small> */}
                                            <div key={item.id} className='message message-sent ms-2'>
                                                <p className="text-xl font-medium">{messageContent}<small className="text-xs font-light ms-2">{item.mTime}</small></p>
                                            </div>
                                        </div>
                                        :
                                        <div className="w-full flex justify-start items-center">
                                            <div key={item.id} className='message message-received  ms-2'>
                                                <small className='underline'>{item.from}</small>
                                                <p className="text-xl font-medium">{messageContent}<small className="text-xs font-light ms-2">{item.mTime}</small></p>
                                            </div>
                                            {/* <small className="text-xs font-light ms-2">{opposite_person}</small> */}
                                        </div>
                                    }
                                </div>
                            );
                        })
                    }
                </div>
                <div className="sticky bottom-0 w-full shadow">
                    <div className="relative">
                        <input onChange={(e)=>setRecentChat(e.target.value)} value={recentChat} placeholder="Type you message" className="w-full rounded-full border-2 p-2"/>
                        <button onClick={(e)=>sendMessage(e)} className="absolute bottom-1 right-2 py-1 px-4 bg-green-600 text-white font-semibold rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-200 w-1/7">Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
}