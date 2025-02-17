// Load env variables right away
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import cors from 'cors';
import express, { Application } from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import channelsRoutes from './routes/channelsRoutes';
import teamsRoutes from './routes/teamsRoutes';
import userRoutes from './routes/userRoutes';
import { createServer } from 'http';
import { Server } from 'socket.io';
// import { runAuthTests } from '../tests/authenticate.test';

const app: Application = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log('a user connected');
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

    const PORT: number = Number(process.env.PORT) || 3000;
    httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    // Uncomment the line below to run the authentication tests
    // runAuthTests();
  } catch (error) {
    console.error('Failed to connect to the database', error);
    process.exit(1); // Exit the process with failure
  }
};

startServer();

export { io };
