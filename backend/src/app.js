import express from 'express';
import indexRoutes from './routes/index.js';
import teamsRoutes from './routes/teams.js';

const server = express();
server.use(express.json());

// Register routes
server.use('/', indexRoutes);
server.use('/users', teamsRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
