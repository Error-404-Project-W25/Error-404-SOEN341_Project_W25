import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to WebSocket server');  
  const conversationId = '1'; 

  // Join the conversation room
  socket.emit('joinRoom', { conversationId });

  // Request messages for the conversation
  socket.emit('getMessages', { conversationId }, (response) => {
    console.log('Messages received:', response.messages);

    // Send a message after getting messages
    const message = {
      content: 'last test',
      sender: 'ue8ynA4g4hW82AFlgUDdbXWH88s1', // user_id
      conversationId: conversationId,
    };

    socket.emit('sendMessage', message, (response) => {
      console.log('Send message response:', response);
    });
  });

  // Listen for new messages
  socket.on('newMessage', (message) => {
    console.log('NEW MESSAGGEEEEEEE');
  });

  // Listen for deleted messages
  socket.on('deleteMessage', (messageId) => {
    console.log('Message deleted:', messageId);
  });
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
});
