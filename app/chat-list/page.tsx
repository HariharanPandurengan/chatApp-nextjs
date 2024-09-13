"use client"

import React, { useEffect , useRef} from 'react';
import Image from "next/image";
import { useState } from "react";
import { RootState } from '../../redux/store';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../redux/hooks';
import { reduxOppositeUsername } from '../../redux/store';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';

let socket;

export default function ChatList() {
  const[req,setReq] = useState(false);
  const[searchUsername,setSeachUsername] = useState('');
  const[userList,setUserList] = useState([]);
  const[requestedList,setRequestedList] = useState([]);
  const[requestsList,setRequestsList] = useState([]);
  const[friendsList,setFriendsList] = useState([]);

  const currentUsername = useSelector((state: RootState) => state.user.username);
  const dispatch = useAppDispatch();
  const router = useRouter()

  useEffect(() => {
    fetchRequestsList();
    fetchRequestedList();
    fetchFriendsList();
    socketInitializer(); 
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [currentUsername]);

  const fetchRequestedList = () => {
    axios
      .get(process.env.NEXT_PUBLIC_API_URL + "/requests", {
        params: { username: currentUsername },
      })
      .then((response) => {
        setRequestedList(response.data.requested);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const fetchRequestsList = () => {
    axios
    .get(process.env.NEXT_PUBLIC_API_URL + "/getRequests", {
      params: { username: currentUsername },
    })
    .then((response) => {
      setRequestsList(response.data.requests);
    })
    .catch((err) => {
      console.log(err.message);
    });
  };

  const fetchFriendsList = () => {
    axios
    .get(process.env.NEXT_PUBLIC_API_URL + "/getFriends", {
      params: { username: currentUsername },
    })
    .then((response) => {
      setFriendsList(response.data.friends);
    })
    .catch((err) => {
      console.log(err.message);
    });
  };

  function socketInitializer(){
    socket = io('http://localhost:4000');

    socket.emit('register', currentUsername);

    socket.on('notification', (data:any) => {
      if(data.message.includes("Your request has been accepted by") || data.message.includes("You has been removed from friend list by")){
        alert(data.message)
        fetchFriendsList()
      }
      else if(data.for = "chat"){
        alert(data.from +' : '+ data.message) 
      }
    });
  }

   useEffect(() =>  {
    if(searchUsername !== ''){
        axios
        .get(process.env.NEXT_PUBLIC_API_URL+'/searchUser',{
          params: { username: searchUsername }
        })
        .then((response) => {
          if(response.data.status === true){
            setUserList(response.data.users)
          }
          else{
              setUserList([])
          }
        })
        .catch((err) => {
          console.log(err.message);
        });

        fetchRequestedList()
        fetchRequestsList()
        fetchFriendsList()
     }
     else{
        setUserList([])
        setRequestedList([])
     }
    }, [searchUsername])

    function sendReq(e,clickedUsername){
        e.preventDefault()
        axios
        .post(process.env.NEXT_PUBLIC_API_URL+'/requests',{clickedUsername:clickedUsername,RequestedUsername:currentUsername})
        .then((response) => {
          if(response.data.status === true){
            alert('Requested Successfully')
            fetchRequestedList()
            fetchRequestsList()
          }
        })
        .catch((err) => {
          console.log(err.message);
        });
    }

    function acceptReq(e,clickedUsername){
      e.preventDefault()

      axios
        .post(process.env.NEXT_PUBLIC_API_URL+'/acceptReq',{requestedUsername:clickedUsername,currentUsername:currentUsername})
        .then((response) => {
          if(response.data.status === true){
            alert('Accepted Successfully')
            fetchRequestedList()
            fetchRequestsList()
            fetchFriendsList()
          }
        })
        .catch((err) => {
          console.log(err.message);
        });

      // Emit a real-time notification to the other user
      socket.emit('accept_request', {
        recipient: clickedUsername,
        currentUser: currentUsername,
      });
    }

    function removeFriend(e,clickedUsername){
      e.preventDefault()

      axios
        .post(process.env.NEXT_PUBLIC_API_URL+'/removeFriend',{clickedUsername:clickedUsername,currentUsername:currentUsername})
        .then((response) => {
          if(response.data.status === true){
            alert('unfriend Successfully')
            fetchRequestedList()
            fetchRequestsList()
            fetchFriendsList()
          }
        })
        .catch((err) => {
          console.log(err.message);
        });

      // Emit a real-time notification to the other user
      socket.emit('remove_friend', {
        recipient: clickedUsername,
        currentUser: currentUsername,
      });
    }

    return(
      <section className="relative min-h-screen flex w-full bg-gradient-to-br from-blue-50 to-indigo-100 p-6">

        <div className="w-1/4 border-2 border-gray-200 me-2 p-4 rounded-xl bg-white shadow-lg">
          <input 
            onChange={(e) => setSeachUsername(e.target.value.toLowerCase())}
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none transition"
            placeholder="Search"
          />
          
          {userList.length !== 0 &&
            userList.map(item => {
              if (item.username !== currentUsername) {
                const friends = friendsList.some((list) => {
                  if(list.user1 === item.username){
                    return true
                  }
                  else if(list.user2 === item.username){
                    return true
                  }
                });
                const isRequested = requestedList.some((list) => list.username === item.username);
                const alreadyRequestsbyOppositePerson = requestsList.some((list) => list.username === item.username);
                return (
                  <div key={item.username} className="bg-white mt-3 flex items-center justify-between rounded-lg p-3 shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
                    <h4 className="text-gray-800 font-medium">{item.username}</h4>
                    
                    {friends ? (
                        <button onClick={(e) => removeFriend(e, item.username)} className="py-1 px-3 bg-red-500 text-white font-semibold rounded-full shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition ease-in-out duration-200">
                          Remove
                        </button>
                    )
                      : isRequested ? (
                        <button disabled className="py-1 px-3 bg-gray-400 text-white font-semibold rounded-full shadow-md cursor-not-allowed">
                          Requested
                        </button>
                    ) : alreadyRequestsbyOppositePerson ? (
                      <button onClick={(e) => acceptReq(e, item.username)} className="py-1 px-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 transition ease-in-out duration-200 shadow-md">
                        Accept
                      </button>
                    ) : (
                      <button onClick={(e) => sendReq(e, item.username)} className="py-1 px-3 bg-blue-500 text-white font-semibold rounded-full shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition ease-in-out duration-200">
                        REQ
                      </button>
                    )}
                  </div>
                );
              }
            })
          }
        </div>
    
        <div className="w-full border border-gray-200 p-6 rounded-xl bg-white shadow-lg">
          <h1 className="text-2xl font-semibold text-indigo-800 mb-6">Welcome, {currentUsername}</h1>
          <h2 className="text-center text-3xl font-bold text-indigo-700 mb-8">Chats</h2>
      
          {friendsList.map(item => (
            <div onClick={()=>{
              dispatch(reduxOppositeUsername(item.user1 === currentUsername ? item.user2 : item.user1))
              router.push('chat')
            }} key={item.user1 === currentUsername ? item.user2 : item.user1} className="relative border border-gray-200 rounded-lg shadow-md bg-white p-4 flex items-center mb-4 hover:bg-indigo-50 hover:shadow-lg transition">
              <Image 
                src="https://thumbs.dreamstime.com/b/default-avatar-profile-icon-social-media-user-vector-default-avatar-profile-icon-social-media-user-vector-portrait-176194876.jpg" 
                alt="Profile Avatar"
                width={50}
                height={50}
                className="rounded-full"
              />
              <div className="flex flex-col justify-center ms-4">
                <h3 className="font-medium text-gray-900">{item.user1 === currentUsername ? item.user2 : item.user1}</h3>
                {/* <p className="text-sm text-gray-600">{item.lastChat}</p> */}
              </div>
              <div className="absolute right-3 bottom-2">
                {/* <p className="text-xs text-gray-500">{item.lastChatDate}</p> */}
              </div>
            </div>
          ))}
        </div>
      
        <div className="absolute right-5 top-5 p-4 text-right w-1/6">
          <button className="bg-red-500 p-2 text-white rounded-full shadow-md hover:bg-red-600 transition transform hover:scale-105" onClick={() => {
            setReq(true)
            fetchRequestsList()
            }}>
            Requests
          </button>
          <div className={req ? 'relative border-2 border-gray-300 shadow-xl bg-white pt-1 w-full rounded-lg mt-2' : 'hidden'}>
            <button className=" top-2 right-2 bg-red-500 px-3 py-1 text-white rounded-full shadow-md hover:bg-red-600 transition" onClick={() => setReq(false)}>
              ×
            </button>
            <h1 className="text-lg underline text-center font-semibold text-gray-800 m-0 mt-2">Requests</h1>
            <div>
              {
                requestsList.length !== 0 && requestsList.map(list=>{
                  return(
                    <div key={list.username} className="border-2 m-1 bg-white mt-3 flex items-center justify-between rounded-lg p-3 shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
                      <h4 className="text-gray-800 font-medium">{list.username}</h4>
                      <button onClick={(e) => acceptReq(e, list.username)} className="py-1 px-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 transition ease-in-out duration-200 shadow-md">
                        Accept
                      </button>
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>
    
      </section>
    )
}