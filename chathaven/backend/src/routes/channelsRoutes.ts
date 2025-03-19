import { Router } from 'express';
import {
  createChannel,
  addUserToChannel,
  getChannelById,
  removeMemberFromChannel,
  deleteChannel,
} from '../controllers/channelsController';

const router: Router = Router();

router.post('/create', createChannel);
router.post('/addUser', addUserToChannel);
router.post('/getChannelById', getChannelById);
router.post('/removeMember', removeMemberFromChannel);
router.delete('/delete/:channelId', deleteChannel);

export default router;
