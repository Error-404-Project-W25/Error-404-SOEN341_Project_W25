 import { Router } from 'express';
 import { createChannel, addUserToChannel, getChannelWithName } from '../controllers/channelsController';
 
 const router: Router = Router();
 
 router.post('/:team_id/create', createChannel);
 router.post('/:team_id/:channel_id/addUser', addUserToChannel);
 router.get('/:team_id/:channel_name', getChannelWithName); 
 
 export default router;
 