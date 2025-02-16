import { Router } from 'express';
import { sendMessage, deleteMessage } from '../controllers/messagesController';

const router: Router = Router();

router.post('/send', sendMessage);
router.post('/delete', deleteMessage);

export default router;
