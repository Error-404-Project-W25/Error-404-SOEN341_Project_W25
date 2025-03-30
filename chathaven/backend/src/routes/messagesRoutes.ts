import { Router } from 'express';
import { sendMessage, deleteMessage, getMessages, searchDirectMessages } from '../controllers/messagesController';

const router: Router = Router();

router.post('/send', sendMessage);
router.post('/delete', deleteMessage);
router.get('/get/:conversationId', getMessages);
router.post('/search/direct', searchDirectMessages);

export default router;
