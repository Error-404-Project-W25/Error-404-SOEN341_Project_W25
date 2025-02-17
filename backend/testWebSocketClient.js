const { io } = require('socket.io-client');

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to WebSocket server');

  // Send a message
  socket.emit('sendMessage', {
    content: 'Hello',
    sender: 'user1',
    conversationId: 'conv1'
  }, (response) => {
    console.log('Send message response:', response);
  });

  // Listen for new messages
  socket.on('newMessage', (message) => {
    console.log('New message received:', message);
  });

  // Listen for deleted messages
  socket.on('deleteMessage', (messageId) => {
    console.log('Message deleted:', messageId);
  });
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
});
