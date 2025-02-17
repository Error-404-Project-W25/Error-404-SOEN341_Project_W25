import { io, Socket } from 'socket.io-client';
import { IMessage, IUser } from '../shared/interfaces';

const socket: Socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to WebSocket server');

  // Send a message
  const message: IMessage = {
    messageId: 'msg1',
    content: 'Hello',
    sender: { user_id: 'ue8ynA4g4hW82AFlgUDdbXWH88s1', firstName: 'Amy', lastName: 'SprintTwo', username: 'amy_sprint_two', email: 'amy_sprint_two@example.com', role: 'admin', teams: [], direct_messages: [] },
    time: new Date().toISOString()
  };

  socket.emit('sendMessage', message, (response: { success: boolean; error?: string }) => {
    console.log('Send message response:', response);
  });

  // Listen for new messages
  socket.on('newMessage', (message: IMessage) => {
    console.log('New message received:', message);
  });

  // Listen for deleted messages
  socket.on('deleteMessage', (messageId: string) => {
    console.log('Message deleted:', messageId);
  });
});

socket.on('disconnect', () => {  console.log('Disconnected from WebSocket server');
});
