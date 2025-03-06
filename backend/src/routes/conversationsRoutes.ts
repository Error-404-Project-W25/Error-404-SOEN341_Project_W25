import { Router } from 'express';
import { createConversation, getConversationById, createDirectMessages } from '../controllers/conversationsController';

const router: Router = Router();

router.post('/create', createConversation);
router.get('/:conversationId', getConversationById);
router.post('/createDirectMessages', createDirectMessages);

export default router;
