 import { Router } from 'express';
 import { createChannel, addUserToChannel, getChannelById } from '../controllers/channelsController';
 
 const router: Router = Router();
 
 router.post('/:team_id/create', createChannel);
 router.post('/:team_id/:channel_id/addUser', addUserToChannel);
 router.get('/:team_id/:channel_id', getChannelById); 
 
 export default router;
 