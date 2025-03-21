import { Router } from 'express';
import {
  getUserById,
  getUserByUsername,
  deleteUser,
  updateStatus,
  getLastSeenString,
} from '../controllers/usersController';

const router: Router = Router();

router.get('/:userId', getUserById);
router.get('/search/:username', getUserByUsername);
router.delete('/delete/:userId', deleteUser);
router.post('/status', updateStatus);
router.post('/lastseen', getLastSeenString);

export default router;
