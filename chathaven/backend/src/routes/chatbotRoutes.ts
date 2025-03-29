import { Router } from 'express';
import { sendPrompt } from '../controllers/chatbotController';

const router: Router = Router();

router.post('/prompt', sendPrompt);

export default router;
