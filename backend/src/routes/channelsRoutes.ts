 import { Router } from 'express';
 import { createChannel, addUserToChannel } from '../controllers/channelsController';
 
 const router: Router = Router();
 
 router.post('/:team_id/create', createChannel);
 router.post('/:channel_id/addUser', addUserToChannel);
 
 export default router;
 