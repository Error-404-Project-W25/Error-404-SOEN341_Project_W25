import { Router } from 'express';
import { 
  sendMessage, 
  deleteMessage, 
  getMessages, 
  searchDirectMessages,
  searchChannelMessages 
} from '../controllers/messagesController';

const router: Router = Router();

router.post('/send', sendMessage);
router.post('/delete', deleteMessage);
router.get('/get/:conversationId', getMessages);
router.post('/search/direct', searchDirectMessages);
router.post('/search/channel', searchChannelMessages); 

export default router;
