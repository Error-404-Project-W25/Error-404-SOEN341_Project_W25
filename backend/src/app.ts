import express, { application, Application } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv'; 
import path from 'path'; 

import indexRoutes from './routes/index';
import teamsRoutes from './routes/teams';

const app: Application = express();

//Load env variables (elements hidden in .env)
dotenv.config({path: path.resolve(__dirname, '../../.env')}); 

//Connect to database 
const DB_CONN_STRING = process.env.DB_CONN_STRING || ''; 
const DB_NAME = process.env.DB_NAME || ''; 

export const connectDB = async (): Promise<void> => {
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

// Call connectDB before starting the server
connectDB().then(() => {
  // After successful connection, start the server
  app.use(express.json());

  // Register routes
  app.use('/', indexRoutes);
  app.use('/teams', teamsRoutes);

  const PORT: number = Number(process.env.PORT) || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});


// app.use(express.json());

// // Register routes
// app.use('/', indexRoutes);
// app.use('/teams', teamsRoutes);


// const PORT: number = Number(process.env.PORT) || 3000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
