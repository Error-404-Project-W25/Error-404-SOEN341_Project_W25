import { Router } from 'express';
import { createConversation, getConversationById } from '../controllers/conversationsController';

const router: Router = Router();

router.post('/create', createConversation);
router.get('/:conversationId', getConversationById);

export default router;
