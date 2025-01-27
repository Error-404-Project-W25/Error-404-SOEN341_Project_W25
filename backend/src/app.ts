import express, { application, Application } from 'express';
import mongoose from 'mongoose';
import indexRoutes from './routes/index';
import teamsRoutes from './routes/teams';

const app: Application = express();


// Connect to MongoDB


app.use(express.json());

// Register routes
app.use('/', indexRoutes);
app.use('/users', teamsRoutes);




const PORT: number = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
