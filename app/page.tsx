"use client"
import React from 'react';
import { useRouter } from "next/navigation";
import { useState , useEffect } from "react";
import axios from 'axios';
import { useAppDispatch } from '../redux/hooks';
import { reduxLogin,reduxUsername } from '../redux/store';
import dynamic from 'next/dynamic';

export default function Login() {
  const router = useRouter()
  const[log,setLog] = useState(true);
  const[username,setUsername] = useState('');
  const[password,setPassword] = useState('');
  const[confirmPassword,setConfirmPassword] = useState('');

  const dispatch = useAppDispatch();

  const AnimatedText = dynamic(() => import('./threeJS/AnimatedText'), {
    ssr: false,
  });

  function login(e){
    e.preventDefault();
   axios
      .post('/api/login',{username:username,password:password})
      .then((response) => {
        if(response.data.status){
          dispatch(reduxLogin(true));
          dispatch(reduxUsername(username));
          router.push("chat-list")
        }
        else{
          alert("Enter correct username and password")
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  function register(e){
    e.preventDefault();
    if(password !== confirmPassword){
      alert('Password & Confirm password not matching')
    }
    else{
      axios
        .post('/api/register',{username:username,password:password})
        .then((response) => {
          if(response.data.status === false){
            alert('Username Already Exist');
          }
          else{
            alert('Registered Successfully');
            setLog(true)
            setUsername('')
            setPassword('')
            setConfirmPassword('')
          }
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  }

  return (
    <section className="min-h-screen w-full p-8 bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <AnimatedText />
        <div className={log ? '' : 'hidden'}>
          <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800">Login</h2>
          <form onSubmit={login} className="flex flex-col space-y-4">
            <input type="text" onChange={(e)=>setUsername(e.target.value)} value={username} placeholder="Username" className="p-3 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-200"/>
            <input type="password" onChange={(e)=>setPassword(e.target.value)} value={password} placeholder="Password" className="p-3 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-200"/>
            <button type="submit" className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-200 w-full">Login</button>
          </form>
          <p className="text-center mt-4 text-gray-600 cursor-pointer hover:underline" onClick={() => setLog(false)}>Do not have an account? Register</p>
        </div>

        <div className={log ? 'hidden' : ''}>
          <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800">Register</h2>
          <form onSubmit={register} className="flex flex-col space-y-4">
            <input onChange={(e)=>setUsername(e.target.value)} value={username} type="text" placeholder="Username" className="p-3 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-200"/>
            <input onChange={(e)=>setPassword(e.target.value)} value={password} type="text" placeholder="Password" className="p-3 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-200"/>
            <input onChange={(e)=>setConfirmPassword(e.target.value)} value={confirmPassword} type="text" placeholder="Confirm Password" className="p-3 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-200"/>
            <button type="submit" className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-200 w-full">Register</button>
          </form>
          <p className="text-center mt-4 text-gray-600 cursor-pointer hover:underline" onClick={() => setLog(true)}>Already have an account? Login</p>
        </div>
      </div>
    </section>
  );
}
