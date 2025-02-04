import express from 'express';
import { getUserInfo, searchUsers } from '../controllers/usersController';

const router = express.Router();

// Route to get user info by user ID
router.get('/info/:user_id', getUserInfo);
router.get('/search/:search_query', searchUsers);

export default router;