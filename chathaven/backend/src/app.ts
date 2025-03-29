// Load env variables right away
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { exec } from 'child_process';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import channelsRoutes from './routes/channelsRoutes';
import teamsRoutes from './routes/teamsRoutes';
import userRoutes from './routes/userRoutes';
import conversationsRoutes from './routes/conversationsRoutes';
import messagesRoutes from './routes/messagesRoutes';
import inboxRoutes from './routes/inboxRoutes';
import chatbotRoutes from './routes/chatbotRoutes';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { sendMessage, getMessages } from './controllers/messagesController';
import { User } from './models/userModel';
import gifRoutes from './routes/gifRoutes';
// import { runAuthTests } from '../tests/authenticate.test';

const app: Application = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

const connectedUsers = new Map<string, string>(); // Key: userId, Value: socketId

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId as string;

  if (userId) {
    connectedUsers.set(userId, socket.id); // Map the userId to their socketId
    console.log(`User ${userId} connected with socket id: ${socket.id}`);
    User.findOneAndUpdate(
      { userId },
      {
        status: 'online',
        lastSeen: new Date(),
      },
      { new: true }
    ).exec();
  } else {
    console.log(`User connected without an ID: ${socket.id}`);
  }

  // Handle custom disconnect event
  socket.on('disconnectUser', ({ userId }) => {
    if (userId) {
      connectedUsers.delete(userId); // Remove userId from the Map
      User.findOneAndUpdate(
        { userId },
        {
          status: 'online',
          lastSeen: new Date(),
        }
      ).exec();
      console.log(`User ${userId} disconnected via sign-out`);
    }
  });

  // Handle automatic disconnection
  socket.on('disconnect', async () => {
    if (userId) {
      connectedUsers.delete(userId); // Remove userId from the Map
      await User.findOneAndUpdate(
        { userId },
        {
          status: 'offline',
          lastSeen: new Date(),
        }
      ).exec();
      console.log(`User ${userId} disconnected`);
    }
  });

  socket.on('joinRoom', ({ conversationId }) => {
    socket.join(conversationId);
    console.log(`User joined room: ${conversationId}`);
  });

  socket.on('sendMessage', async (data, callback) => {
    const req = {
      body: data,
    } as Request;
    const res = {
      status: (statusCode: number) => ({
        json: (responseBody: any) => {
          callback(responseBody);
        },
      }),
    } as Response;

    await sendMessage(req, res);
  });

  socket.on('getMessages', async (data, callback) => {
    const req = {
      params: data,
    } as Request;
    const res = {
      status: (statusCode: number) => ({
        json: (responseBody: any) => {
          callback(responseBody);
        },
      }),
    } as Response;

    await getMessages(req, res);
  });
});

// Connect to database
const DB_CONN_STRING = process.env.DB_CONN_STRING || '';
const DB_NAME = process.env.DB_NAME || '';

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(DB_CONN_STRING, {
      dbName: DB_NAME,
    });
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const startServer = async () => {
  try {
    await connectDB();
    // After successful connection, start the server
    app.use(cors());
    app.use(express.json());

    // Register routes
    app.use('/teams', teamsRoutes);
    app.use('/auth', authRoutes);
    app.use('/channels', channelsRoutes);
    app.use('/users', userRoutes);
    app.use('/conversations', conversationsRoutes);
    app.use('/messages', messagesRoutes);
    app.use('/inbox', inboxRoutes);
    app.use('/chatbot', chatbotRoutes);
    app.use('/gif', gifRoutes); // Ensure this line is present and correct

    const PORT: number = Number(process.env.PORT) || 3000;

    if (process.env.NODE_ENV !== 'test') {
      httpServer
        .listen(PORT, () => console.log(`Server running on port ${PORT}`))
        .on('error', (err: NodeJS.ErrnoException) => {
          if (err.code === 'EADDRINUSE') {
            console.error(
              `Port ${PORT} is already in use. Trying to close the port...`
            );
            // Find and kill the process using the port
            exec(`netstat -ano | findstr :${PORT}`, (err, stdout, stderr) => {
              if (err) {
                console.error(`Error finding process using port ${PORT}:`, err);
                return;
              }
              const pid = stdout.split('\n')[0].trim().split(/\s+/).pop();
              if (pid) {
                exec(`taskkill /PID ${pid} /F`, (err, stdout, stderr) => {
                  if (err) {
                    console.error(`Error killing process ${pid}:`, err);
                    return;
                  }
                  console.log(
                    `Process ${pid} killed. Trying to restart the server...`
                  );
                  httpServer.listen(PORT, () =>
                    console.log(`Server running on port ${PORT}`)
                  );
                });
              }
            });
          } else {
            console.error('Server error:', err);
            process.exit(1);
          }
        });
    }

    // Uncomment the line below to run the authentication tests
    // runAuthTests();
  } catch (error) {
    console.error('Failed to connect to the database', error);
    process.exit(1); // Exit the process with failure
  }
};

startServer();
export { app, io, connectDB, startServer, connectedUsers };
