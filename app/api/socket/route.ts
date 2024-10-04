import { Server } from 'socket.io';
import { NextResponse } from 'next/server';

let io: Server;
const connectedUsers: Record<string, string> = {}; // To store the connected users

export async function GET() {
  if (!io) {
    // Initialize the Socket.io server
    io = new Server({
      path: '/api/socket',
      // transports: ['websocket','polling'],
    });

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Store the connected user with their username
      socket.on('register', (username) => {
        connectedUsers[username] = socket.id;
        console.log(`${username} is connected with socket id ${socket.id}`);
      });

      // Handle request acceptance and notify the recipient
      socket.on('accept_request', (data) => {
        const { recipient, currentUser } = data;

        if (connectedUsers[recipient]) {
          io.to(connectedUsers[recipient]).emit('notification', {
            message: `Your request has been accepted by ${currentUser}`,
          });
        } else {
          console.log('Recipient is not online.');
        }
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Remove the disconnected user from the connectedUsers list
        for (const username in connectedUsers) {
          if (connectedUsers[username] === socket.id) {
            delete connectedUsers[username];
          }
        }
      });
    });
  }

  return NextResponse.json({ message: 'Socket.io server is running' });
}