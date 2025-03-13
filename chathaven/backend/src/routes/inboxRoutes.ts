import { Router } from 'express';
import { requestToJoin, response } from '../controllers/inboxController';

const router: Router = Router();

router.post('/request', requestToJoin);
router.post('/response', response);

export default router;
