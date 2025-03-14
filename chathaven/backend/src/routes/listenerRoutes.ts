import { Router } from 'express';
import { watchChanges } from '../controllers/listenersController';

const router: Router = Router();

router.get('/changes/:userId', watchChanges);

export default router;
