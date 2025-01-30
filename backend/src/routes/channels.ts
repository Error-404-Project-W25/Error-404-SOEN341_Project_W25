 import { Router } from 'express';
 import { createChannel, addUserToChannel } from '../controllers/channelsController';
 
 const router: Router = Router();
 
 router.post('/', createChannel);
 router.post('/', addUserToChannel);
 
 export default router;
 