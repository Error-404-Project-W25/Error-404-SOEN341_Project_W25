import { Router } from 'express';
import { getUserById, getUserByUsername, deleteUser } from '../controllers/usersController';

const router: Router = Router();

router.get('/:user_id', getUserById);
router.get('/search/:username', getUserByUsername);
router.delete('/delete/:user_id', deleteUser);

export default router;
