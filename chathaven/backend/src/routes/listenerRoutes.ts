import { Router } from 'express';
import {
  addedToTeamListener,
  addedToChannelListener,
  addedToDirectMessageListener,
} from '../controllers/listenersController';

const router: Router = Router();

router.post('/added-to-team', addedToTeamListener);
router.post('/added-to-channel', addedToChannelListener);
router.post('/added-to-dm', addedToDirectMessageListener);

export default router;
