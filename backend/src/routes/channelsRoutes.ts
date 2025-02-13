import { Router } from 'express';
import {
  createChannel,
  addUserToChannel,
  getChannelById,
} from '../controllers/channelsController';

const router: Router = Router();

router.post('/create', createChannel);
router.post('/addUser', addUserToChannel);
router.post('/getChannelById', getChannelById);

export default router;
