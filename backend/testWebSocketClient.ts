// import { io, Socket } from 'socket.io-client';
// import { BackendService } from '../frontend/src/services/backendService';
// import { IMessage } from '@shared/interfaces';

// const socket: Socket = io('http://localhost:3000');
// const backendService = new BackendService();

// socket.on('connect', async () => {
//   console.log('Connected to WebSocket server');  
//   const conversationId = '1'; // Replace with actual conversationId

//   // Join the conversation room
//   await backendService.joinRoom(conversationId);

//   // Request messages for the conversation
//   socket.emit('getMessages', { conversationId }, async (response: { messages: IMessage[] }) => {
//     console.log('Messages received:', response.messages);

//     // Send a message after getting messages
//     const message = {
//       content: 'using backend services i hope it works :)',
//       sender: 'ue8ynA4g4hW82AFlgUDdbXWH88s1', // user_id
//       conversationId: conversationId,
//     };

//     try {
//       await backendService.sendMessage(message.content, message.conversationId, message.sender);
//       console.log('Send message response: success');
//     } catch (error) {
//       console.log('Send message response: failure');
//     }
//   });

//   // Listen for new messages
//   socket.on('newMessage', (message: IMessage) => {
//     console.log('New message received:', message);
//   });

//   // Listen for deleted messages
//   socket.on('deleteMessage', (messageId: string) => {
//     console.log('Message deleted:', messageId);
//   });
// });

// socket.on('disconnect', () => {
//   console.log('Disconnected from WebSocket server');
// });
