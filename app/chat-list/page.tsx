"use client"

import React, { useEffect } from 'react';
import Image from "next/image";
import { useState } from "react";
import { RootState } from '../../redux/store';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../redux/hooks';
import { reduxOppositeUsername } from '../../redux/store';
import { reduxGroupIDandName } from '../../redux/store';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
import CryptoJs from "crypto-js"

let socket;

export default function ChatList() {
  const[req,setReq] = useState(false);
  const[searchUsername,setSearchUsername] = useState('');
  const[userList,setUserList] = useState([]);
  const[requestedList,setRequestedList] = useState([]);
  const[requestsList,setRequestsList] = useState([]);
  const[friendsList,setFriendsList] = useState([]);
  const[showNotification, setShowNotification] = useState(false);
  const[showChatNotification, setShowChatNotification] = useState(false);
  const[showGroupChatNotification, setShowGroupChatNotification] = useState(false);
  const[showGroupChatCreationNotification, setShowGroupChatCreationNotification] = useState(false);
  const[currentNotification,setCurrentNotofication] = useState("")
  const[notfiFrom,setNotfiFrom] = useState('')
  const[notfiFromGroup,setNotfiFromGroup] = useState('')
  const[groupChat,setGroupChat] = useState(false)
  const[groupName,setGroupName] = useState('')
  const[groupChatlist,setGroupChatlist] = useState([])
  const[groupChatFriendlist,setGroupChatFriendlist] = useState([])
  const[searchGroupChatFriendlist,setSearchGroupChatFriendlist] = useState(groupChatFriendlist)
  const[groupChatCreation,setGroupChatCreation]=useState(false)
  const[newGroupMembers, setNewGroupMembers] = useState([]);
  const[chatOrder,setChatOrder] = useState([])
  const [loading, setLoading] = useState(false);

  const currentUsername = useSelector((state: RootState) => state.user.username);
  // const currentUsername = 'hari';
  const dispatch = useAppDispatch();
  const router = useRouter()

  useEffect(() => {
    setLoading(true); 

    Promise.all([
      fetchRequestsList(),
      fetchRequestedList(),
      fetchFriendsList(),
      fetchGroups(),
      fetchChatOrder(),
    ])
      .then(() => {
        socketInitializer();
      })
      .finally(() => {
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [currentUsername]);

  function fetchChatOrder(){
    axios
    .post('/api/chatOrder',{ username : currentUsername })
    .then((response) => {
      setChatOrder(response.data.chatOrder)
    })
    .catch((err) => {
      console.log(err.message);
    })
  }

  //notification setUp

  const triggerNotification = () => {
    setShowNotification(true);
    // Automatically hide after 5 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  const triggerChatNotification = () => {
    setShowChatNotification(true);
    // Automatically hide after 5 seconds
    setTimeout(() => {
      setShowChatNotification(false);
    }, 5000);
  };

  const triggerGroupChatNotification = () => {
    setShowGroupChatNotification(true);
    // Automatically hide after 5 seconds
    setTimeout(() => {
      setShowGroupChatNotification(false);
    }, 5000);
  };

  const triggerGroupChatCreationNotification = () => {
    setShowGroupChatCreationNotification(true);
    // Automatically hide after 5 seconds
    setTimeout(() => {
      setShowGroupChatCreationNotification(false);
    }, 5000);
  };

  const handleSwipeUp = () => {
    setShowNotification(false);
    setShowChatNotification(false);
    setShowGroupChatNotification(false);
  };

  useEffect(() => {
    if (showNotification) {
      fetchFriendsList();
      const handleTouchMove = (e) => {
        if (e.changedTouches[0].clientY < 50) {
          handleSwipeUp(); // Detect swipe up gesture
        }
      };
      window.addEventListener("touchmove", handleTouchMove);

      // Cleanup the event listener when notification disappears
      return () => {
        window.removeEventListener("touchmove", handleTouchMove);
      };
    }
  }, [showNotification]);

  const fetchRequestedList = () => {
    axios
      .get("/api/requests", {
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
    .get("/api/getRequests", {
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
    setLoading(true)
    axios
    .get("/api/getFriends", {
      params: { username: currentUsername },
    })
    .then((response) => {
      setFriendsList(response.data.friends);

      let updatedGroupChatFriendlist = [];
      response.data.friends.length !== 0 &&
      response.data.friends.forEach(item => {
        if (item.user1 === currentUsername && !updatedGroupChatFriendlist.includes(item.user2)) {
          updatedGroupChatFriendlist.push(item.user2);
        } else if (!updatedGroupChatFriendlist.includes(item.user1)) {
          updatedGroupChatFriendlist.push(item.user1);
        }
      });

      setGroupChatFriendlist(updatedGroupChatFriendlist);
      setSearchGroupChatFriendlist(updatedGroupChatFriendlist)
    })
    .catch((err) => {
      console.log(err.message);
    })
    .finally(()=>{
      setLoading(false)
    })
  }; 

  const fetchGroups = () => {
    axios
    .get("/api/groupChat", {
      params: { username: currentUsername },
    })
    .then((response) => {
      setGroupChatlist(response.data.groups);
    })
    .catch((err) => {
      console.log(err.message);
    });
  };

  function createGroup(e){
    e.preventDefault()
    if(groupName === ''){
      alert('Enter Group Name')
    }
    else{
      axios
      .post("/api/groupChat", {
        group : {
          name:groupName,
          members:newGroupMembers,
          admin:currentUsername
        }
      })
      .then((response) => {
        if(response.data.status === true){
          socket.emit('new_group', {
            recipients: newGroupMembers,
            currentUser: currentUsername,
            groupName:groupName
          });
          setGroupChatlist([]);
          fetchGroups();
          alert('Group Created')
          setGroupChatCreation(false)
        }
        else{
          console.log(response)
        }
        
      })
      .catch((err) => {
        console.log(err.message);
      });
    }
  }

  function socketInitializer(){
    socket = io('https://chatapp-socketio-lhgx.onrender.com/');

    socket.emit('register', currentUsername);

    socket.on('notification', (data:any) => {
      if((data.message && data.message.includes("Your request has been accepted by")) || (data.message && data.message.includes("You are removed from friend list by" )) || (data.message && data.message.includes("you have a new friend request" ))){
        if(data.message && data.message.includes("you have a new friend request")){
          fetchRequestsList()
        }
        fetchRequestedList()
        fetchRequestsList()
        fetchFriendsList()
        setCurrentNotofication(data.message)
        triggerNotification()
      }
      else if(data.for === "new chat"){
        fetchChatOrder();
        setNotfiFrom(data.from)
        setCurrentNotofication(data.message)
        triggerChatNotification()
      }
      else if(data.for === "group chat"){
        setNotfiFromGroup(data.groupName)
        setNotfiFrom(data.from)
        setCurrentNotofication(data.message)
        triggerGroupChatNotification()
      }
      else if(data.for === "new group"){
        setNotfiFromGroup(data.groupName)
        setNotfiFrom(data.from)
        triggerGroupChatCreationNotification()
        fetchGroups()
      }
    });
  }

   useEffect(() =>  {
      if(searchUsername !== ''){
        axios
        .get('/api/searchUser',{
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
        .post('/api/requests',{clickedUsername:clickedUsername,RequestedUsername:currentUsername})
        .then((response) => {
          if(response.data.status === true){
            alert('Requested Successfully')
            fetchRequestedList()
          }
        })
        .catch((err) => {
          console.log(err.message);
        });

        socket.emit('send_request', {
          recipient: clickedUsername,
          currentUser: currentUsername,
        });
    }

    function acceptReq(e,clickedUsername){
      e.preventDefault()

      axios
        .post('/api/acceptReq',{requestedUsername:clickedUsername,currentUsername:currentUsername})
        .then((response) => {
          if(response.data.status === true){
            alert('Accepted Successfully')
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
        .post('/api/removeFriend',{clickedUsername:clickedUsername,currentUsername:currentUsername})
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

    useEffect(()=>{
      setLoading(true);
      setTimeout(() => {
        setLoading(false)
      }, 1000);
    },[chatOrder,friendsList])

    return(
      <section className="relative min-h-screen sm:flex w-full bg-gradient-to-br from-blue-50 to-indigo-100 sm:p-6 p-1 pt-7">
    
        {
          loading && 
          <div className="loading-container">
            <div className='bg-white flex items-center p-2 px-4'>
              <h2 className='me-2 text-black'>Loading...</h2>
              <div className="spinner"></div>
            </div>
          </div>
        }

      <div className="fixed z-50 sm:z-0 top-2 left-1/2 w-[95%] transform -translate-x-1/2 sm:relative sm:top-auto sm:left-auto sm:transform-none sm:w-1/4 border-2 border-gray-200 sm:me-2 p-4 rounded-xl bg-white shadow-lg">
        <input 
          onChange={(e) => setSearchUsername(e.target.value.toLowerCase())}
          className="w-full text-black px-4 py-2 mb-4 border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none transition"
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
                <div key={item.username} className="bg-white mt-3 lg:flex items-center justify-between rounded-lg p-3 shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
                  <h4 className="font-bold me-2 text-center text-black">{item.username}</h4>
                
                  {friends ? (
                    <div className='flex justify-between items-center w-full'>
                      <button onClick={(e) => removeFriend(e, item.username)} className="py-1 text-sm px-3 bg-red-500 text-white font-semibold rounded-full shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition ease-in-out duration-200 w-[45%]">
                        Remove
                      </button>
                      <button onClick={(e)=>{
                        dispatch(reduxOppositeUsername(item.username))
                        router.push('chat')
                      }} className="py-1 text-sm px-3 bg-green-500 text-black font-semibold rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 transition ease-in-out duration-200 w-[45%]">
                          Chat
                      </button>
                    </div>
                  )
                    : isRequested ? (
                      <button disabled className="py-1 px-3 bg-gray-400 text-white font-semibold rounded-full shadow-md cursor-not-allowed w-full">
                        Requested
                      </button>
                  ) : alreadyRequestsbyOppositePerson ? (
                    <button onClick={(e) => acceptReq(e, item.username)} className="py-1 px-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 transition ease-in-out duration-200 shadow-md w-full">
                      Accept
                    </button>
                  ) : (
                    <button onClick={(e) => sendReq(e, item.username)} className="py-1 px-3 bg-blue-500 text-white font-semibold rounded-full shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition ease-in-out duration-200 w-full">
                      REQ
                    </button>
                  )}
                </div>
              );
            }
          })
        }
      </div>
  
      <div className="w-full mt-20 sm:mt-0 border border-gray-200 p-6 rounded-xl bg-white shadow-lg">
        <div className='flex justify-between items-center mb-6 w-full'>
          <h1 className="text-2xl w-[60%] font-semibold text-indigo-800">Welcome, {currentUsername}</h1>

          {/* request */}
          <div className="w-[40%] sm:p-4 p-2 text-right overflow-hidden"> 
            <div className='relative'>
              <p className={requestsList.length !== 0 ? 'absolute right-0 top-0 px-1 sm:right-2 sm:top-1 border border-white z-30 text-xs text-white bg-red-500 rounded-full sm:px-2 sm:py-1' : 'hidden'}>{requestsList.length}</p>
              <button className="mt-2 me-1 sm:me-4 sm:mt-4 text-xs sm:text-base bg-red-500 p-2 text-white rounded-full shadow-md hover:bg-red-600 transition transform hover:scale-105" onClick={() => {
                setReq(true)
                fetchRequestsList()
                }}>
                Requests
              </button>
            </div>
            <div className={req ? 'absolute left-0 top-0 z-50 w-full bg-gray-500 bg-opacity-80 h-screen' : 'hidden'}>
              <div className='relative h-[50vh] sm:h-[70vh] overflow-y-auto top-[20%] w-[90%] m-auto border-2 border-gray-300 shadow-xl bg-white rounded-lg pt-1 mt-2 px-2'>
                <button className=" top-2 right-2 bg-red-500 px-3 py-1 text-white rounded-full shadow-md hover:bg-red-600 transition" onClick={() => setReq(false)}>
                  ×
                </button>
                <h1 className="text-lg underline text-center font-semibold text-gray-800 m-0 mt-2">Requests</h1>
                <div>
                  {
                    requestsList.length !== 0 && requestsList.map(list=>{
                      return(
                        <div key={list.username} className="border-2 m-1 bg-white mt-3 lg:flex items-center justify-between sm:justify-center rounded-lg p-3 shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
                          <h4 className="font-bold text-center text-gray-800 font-medium me-2">{list.username}</h4>
                          <button onClick={(e) => acceptReq(e, list.username)} className="w-full sm:w-1/4 py-1 px-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 transition ease-in-out duration-200 shadow-md">
                            Accept
                          </button>
                        </div>
                      )
                    })
                  }
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {!groupChat &&
          <>
            <div className='flex items-center w-full sm:mb-8 mb-3 relative'>
              <h2 className="text-center text-3xl font-bold text-indigo-700 w-[100%]">Chats</h2>
              <h6 className=" absolute right-0 text-center lg:w-[15%] md:w-[20%] sm:w-[30%] w-[25%] text-xs sm:text-sm underline cursor-pointer hover:bg-gray-200" onClick={()=>{
                  setGroupChat(true);
                  fetchGroups()
                }
                }>Group Chat</h6>
            </div>
            
            {
              [...chatOrder].reverse().map(item => (
                <div onClick={()=>{
                  dispatch(reduxOppositeUsername(item.username))
                  router.push('chat')
                }} key={item.username} className="relative border border-gray-200 rounded-lg shadow-md bg-white p-4 pb-5 sm:pb-4 flex items-center mb-4 hover:bg-indigo-50 hover:shadow-lg transition">
                  <Image 
                    src="https://thumbs.dreamstime.com/b/default-avatar-profile-icon-social-media-user-vector-default-avatar-profile-icon-social-media-user-vector-portrait-176194876.jpg" 
                    alt="Profile Avatar"
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                  <div className="flex flex-col justify-center ms-4">
                    <h3 className="font-medium text-gray-900">{item.username}</h3>
                    {
                      item.from === currentUsername 
                      ?
                        <p className="text-sm text-gray-600">{'You : ' +CryptoJs.AES.decrypt(item.lastChat, "mes").toString(CryptoJs.enc.Utf8)}</p>
                      :
                        <p className="text-sm text-gray-600">{item.from + ' : ' + CryptoJs.AES.decrypt(item.lastChat, "mes").toString(CryptoJs.enc.Utf8)}</p>
                    }
                  </div>
                  <div className="absolute sm:right-3 sm:bottom-2 left-0 bottom-0 w-full text-center ">
                    <p className="text-xs text-gray-500">{item.lastChatDate+' | '+item.lastChatTime}</p>
                  </div>
                </div>
              ))
            }

            {friendsList.filter(item => {
              if(item.user1 === currentUsername){
                return !chatOrder.some(list => list.username === item.user2)
              }
              else{
                return !chatOrder.some(list => list.username === item.user1)
              }
            }).map(item => (
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

          </>
        }

        {groupChat &&
          <>
            <div className='flex items-center w-full mb-8'>
              <button className="text-xs sm:text-sm p-1 text-center rounded w-[15%] sm:w-[20%] cursor-pointer bg-green-500 text-white" onClick={()=>setGroupChatCreation(true)}>Create Group</button>
              <h2 className="text-center text-3xl font-bold text-indigo-700 w-[70%] sm:w-[60%]">Group Chat</h2>
              <button className="text-right w-[15%] sm:w-[20%] cursor-pointer underline" onClick={()=>setGroupChat(false)}>Chat</button>
            </div>

            {groupChatlist.length !== 0 && groupChatlist.map(item => (
              <div onClick={()=>{
                  dispatch(reduxGroupIDandName({groupID:item.groupID,groupName:item.groupName}))
                  router.push('groupChat')
                }} key={item.groupID} className="relative border border-gray-200 rounded-lg shadow-md bg-white p-4 flex items-center mb-4 hover:bg-indigo-50 hover:shadow-lg transition">
                <Image 
                  src="https://png.pngtree.com/png-vector/20191009/ourmid/pngtree-group-icon-png-image_1796653.jpg" 
                  alt="Profile Avatar"
                  width={50}
                  height={50}
                  className="rounded-full"
                />
                <div className="flex flex-col justify-center ms-4">
                  <h3 className="font-medium text-gray-900">{item.groupName}</h3>
                  {/* <p className="text-sm text-gray-600">{item.lastChat}</p> */}
                </div>
                <div className="absolute right-3 bottom-2">
                  {/* <p className="text-xs text-gray-500">{item.lastChatDate}</p> */}
                </div>
              </div>
            ))}
          </>
        }
      </div>

      {
        groupChatCreation && 
          <div className='absolute bg-black bg-opacity-50 top-0 bottom-0 left-0 right-0 w-full z-30 flex items-center justify-center'>
            <div className='w-4/5 bg-yellow-50 rounded-lg p-6 shadow-2xl'>
              <h2 className='text-center mb-4 underline shadow-sm rounded bg-yellow-200 px-3 py-1 font-semibold'>
                Group Creation
              </h2>
              <div className='flex flex-col'>
                <h4 className='mb-1 font-medium'>Enter Group Name:</h4>
                <input 
                  className='mb-4 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400'
                  placeholder='Group Name' 
                  onChange={(e) => setGroupName(e.target.value)} 
                />

                {/* New Members List */}
                <div className='bg-white p-3 mb-4 rounded-lg border border-gray-200 shadow-inner'>
                  <h3 className='font-medium text-gray-700 mb-2'>Added Members : {newGroupMembers.length}</h3>
                  <div className='overflow-x-auto flex space-x-2'>
                    {
                      newGroupMembers.map((user, index) => {
                        return (
                          <div key={user} className='bg-green-100 px-3 py-1 rounded-lg flex items-center'>
                            <p className='text-sm text-green-800'>{user}</p>
                            <small 
                              className='ml-2 bg-red-500 text-white rounded-full px-2 py-1 cursor-pointer hover:bg-red-700 transition-all duration-300'
                              onClick={()=>setNewGroupMembers(newGroupMembers.filter(member => member !== user))}
                            >
                              X
                            </small>
                          </div>
                        )
                      })
                    }
                  </div>
                </div>

                <h4 className='mb-1 font-medium'>Add Members:</h4>
                <input 
                  className='mb-3 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400'
                  placeholder='Search username'
                  onChange={(e) => {
                    let startsWithsearchName = groupChatFriendlist.filter(element => element.startsWith(e.target.value));
                    setSearchGroupChatFriendlist(startsWithsearchName);
                    e.target.value === '' && setSearchGroupChatFriendlist(groupChatFriendlist);
                  }}
                />

                {searchGroupChatFriendlist.length !== 0 && <p className='font-medium text-gray-600'>Friends:</p>}
                <div className='flex overflow-x-auto items-center'>
                  {
                    searchGroupChatFriendlist.map(user => {
                      return (
                        <div key={user} className='flex justify-between items-center me-2 bg-blue-100 px-2 py-1 rounded-lg'>
                          <h4 className='font-bold text-blue-600 m-0 p-0 me-2'>{user}</h4>
                          <button
                            className={!newGroupMembers.includes(user) ?'bg-green-500 px-3 py-1 rounded-lg text-white shadow-sm hover:bg-green-600 transition-all duration-300':'bg-gray-500 px-3 py-1 rounded-lg text-white shadow-sm cursor-not-allowed'}
                            onClick={() => {
                              if (!newGroupMembers.includes(user)) {
                                setNewGroupMembers([...newGroupMembers, user]);
                              }
                            }}
                          >
                            {!newGroupMembers.includes(user) ?'ADD':'ADDED'}
                          </button>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
              {newGroupMembers.length !== 0 &&
              <div className='mt-4 flex items-center justify-between'>
                <button className='bg-red-500 text-white rounded-lg px-4 py-2 hover:bg-red-600 transition-all duration-300' onClick={()=>{
                  setSearchGroupChatFriendlist(groupChatFriendlist);
                  setGroupName('');
                  setNewGroupMembers([]);
                  setGroupChatCreation(false)
                }}>
                  Cancel
                </button>
                <button className='bg-green-500 text-white rounded-lg px-4 py-2 hover:bg-green-600 transition-all duration-300' onClick={(e)=>{
                  
                  createGroup(e)
                }}>
                  Create
                </button>
              </div>
              }
            </div>
          </div>
      }
  
      {showNotification && (
        <div
          className="fixed top-0 left-1/2 transform -translate-x-1/2  bg-green-500 text-white py-3 px-4 shadow-lg flex justify-between items-center transition-transform duration-500 transform sm:w-1/2 w-[90%]"
          style={{ zIndex: 1000 }}
        >
          <span>{currentNotification}</span>
          <button onClick={handleSwipeUp} className="ml-4">Dismiss</button>
        </div>
      )}

      {showChatNotification && (
        <div
          className="fixed top-0 left-1/2 transform -translate-x-1/2  bg-green-500 text-white py-3 px-4 shadow-lg flex justify-between items-center transition-transform duration-500 transform sm:w-1/2 w-[90%]"
          style={{ zIndex: 1000 }}
        >
          <span>{notfiFrom +' : ' +currentNotification.slice(0, 10)+'...'}</span>
          <button onClick={handleSwipeUp} className="ml-4">Dismiss</button>
        </div>
      )}

      {showGroupChatNotification && (
        <div
          className="fixed top-0 left-1/2 transform -translate-x-1/2  bg-green-500 text-white py-3 px-4 shadow-lg flex justify-between items-center transition-transform duration-500 transform w-1/2"
          style={{ zIndex: 1000 }}
        >
          <span>{'Group : '+notfiFromGroup+ ' | '+ notfiFrom +' : '+currentNotification.slice(0, 10)+'...'}</span>
          <button onClick={handleSwipeUp} className="ml-4">Dismiss</button>
        </div>
      )}

      {showGroupChatCreationNotification && (
        <div
          className="fixed top-0 left-1/2 transform -translate-x-1/2  bg-green-500 text-white py-3 px-4 shadow-lg flex justify-between items-center transition-transform duration-500 transform w-1/2"
          style={{ zIndex: 1000 }}
        >
          <span>{notfiFrom + ' | ' +'Created Group : '+notfiFromGroup}</span>
          <button onClick={handleSwipeUp} className="ml-4">Dismiss</button>
        </div>
      )}
    </section>
  )
}