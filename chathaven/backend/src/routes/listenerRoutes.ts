import { Router } from 'express';
import { watchChanges } from '../controllers/listenersController';

const router: Router = Router();

router.post('/changes', watchChanges);

export default router;
