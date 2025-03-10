import { Router } from 'express';
import { getUserById, getUserByUsername } from '../controllers/usersController';

const router: Router = Router();

router.get('/:userId', getUserById);
router.get('/search/:username', getUserByUsername);

export default router;
