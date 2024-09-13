// // app/api/socket/middleware.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { Server } from 'socket.io';

// const io = new Server({
//   path: '/api/socket',
//   transports: ['websocket'],
// });

// io.on('connection', (socket) => {
//   console.log('User connected:', socket.id);

//   socket.on('register', (username) => {
//     console.log(`${username} is connected with socket id ${socket.id}`);
//     // Handle user registration logic here
//   });

//   socket.on('accept_request', (data) => {
//     const { recipient, currentUser } = data;
//     // Handle request acceptance logic here
//   });

//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
//     // Handle user disconnection logic here
//   });
// });

// // Middleware function to attach the Socket.IO server to the request
// export function middleware(req: NextRequest) {
//   if (req.url.includes('/api/socket')) {
//     return NextResponse.next(); // Let the request pass through to the Socket.IO server
//   }

//   return NextResponse.next();
// }
