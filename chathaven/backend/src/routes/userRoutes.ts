import { Router } from 'express';
import {
  getUserById,
  getUserByUsername,
  deleteUser,
  updateStatus,
  ping, 
  getLastSeenString,
} from '../controllers/usersController';

const router: Router = Router();

router.get('/:userId', getUserById);
router.get('/search/:username', getUserByUsername);
router.delete('/delete/:userId', deleteUser);
router.post('/status', updateStatus);
// router.post('/ping', ping);
// router.post('/lastseen', getLastSeenString);

export default router;
