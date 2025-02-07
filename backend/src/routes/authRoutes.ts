import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserInfo,
} from '../controllers/usersController';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/getUserInfo', getUserInfo);

export default router;
