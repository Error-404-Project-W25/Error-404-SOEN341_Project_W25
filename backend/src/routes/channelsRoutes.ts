 import { Router } from 'express';
 import { createChannel, addUserToChannel } from '../controllers/channelsController';
 
 const router: Router = Router();
 
 router.post('/create', createChannel);
 router.post('/addUser', addUserToChannel);
 
 export default router;
 