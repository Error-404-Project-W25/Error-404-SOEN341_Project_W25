import { Router } from 'express';
import { sendMessage, deleteMessage, getMessages } from '../controllers/messagesController';

const router: Router = Router();

router.post('/send', sendMessage);
router.post('/delete', deleteMessage);
router.get('/get/:conversationId', getMessages);

export default router;
