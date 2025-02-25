// Load env variables right away
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import channelsRoutes from './routes/channelsRoutes';
import teamsRoutes from './routes/teamsRoutes';
import userRoutes from './routes/userRoutes';
import conversationsRoutes from './routes/conversationsRoutes';
import messagesRoutes from './routes/messagesRoutes';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { sendMessage, getMessages } from './controllers/messagesController';
// import { runAuthTests } from '../tests/authenticate.test';

const app: Application = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('joinRoom', ({ conversationId }) => {
    socket.join(conversationId);
    console.log(`User joined room: ${conversationId}`);
  });

  // socket.on('sendMessage', async (data, callback) => {
  //   const req = {
  //     body: data,
  //   } as Request;
  //   const res = {
  //     status: (statusCode: number) => ({
  //       json: (responseBody: any) => {
  //         callback(responseBody);
  //       },
  //     }),
  //   } as Response;

  //   await sendMessage(req, res);
  // });

  // socket.on('getMessages', async (data, callback) => {
  //   const req = {
  //     params: data,
  //   } as Request;
  //   const res = {
  //     status: (statusCode: number) => ({
  //       json: (responseBody: any) => {
  //         callback(responseBody);
  //       },
  //     }),
  //   } as Response;

  //   await getMessages(req, res);
  // });

  socket.on('sendMessage', async (data, callback) => {
    const req = {
      body: data,
    } as Request;
    const res = {
      status: () => ({
        json: (responseBody: any) => {
          callback(responseBody);
        },
      }),
    } as unknown as Response;

    await sendMessage(req, res);
  });

  socket.on('getMessages', async (data, callback) => {
    const req = {
      params: data,
    } as Request;
    const res = {
      status: () => ({
        json: (responseBody: any) => {
          callback(responseBody);
        },
      }),
    } as unknown as Response;

    await getMessages(req, res);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
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

    const PORT: number = Number(process.env.PORT) || 3000;

    if (process.env.NODE_ENV !== 'test'){
      httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }

    // Uncomment the line below to run the authentication tests
    // runAuthTests();
  } catch (error) {
    console.error('Failed to connect to the database', error);
    process.exit(1); // Exit the process with failure
  }
};

startServer();
export { app, io, connectDB, startServer };

