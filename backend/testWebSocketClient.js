const { io } = require('socket.io-client');

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to WebSocket server');

  // Send a message
  const message = {
    messageId: 'msg1',
    content: 'Hello',
    sender: { user_id: 'ue8ynA4g4hW82AFlgUDdbXWH88s1', firstName: 'Amy', lastName: 'SprintTwo', username: 'amy_sprint_two', email: 'amy_sprint_two@example.com', role: 'admin', teams: [] },
    time: new Date().toISOString()
  };

  socket.emit('sendMessage', message, (response) => {
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
