import express from 'express';
import { getUserInfo } from '../controllers/usersController';

const router = express.Router();

// Route to get user info by user ID
router.get('/user/info/:user_id', getUserInfo);

export default router;