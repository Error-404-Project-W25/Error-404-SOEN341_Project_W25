import { Router } from 'express';
import {
  getUserById,
  getUserByUsername,
  deleteUser,
} from '../controllers/usersController';

const router: Router = Router();

router.get('/:userId', getUserById);
router.get('/search/:username', getUserByUsername);
router.delete('/delete/:userId', deleteUser);

export default router;
