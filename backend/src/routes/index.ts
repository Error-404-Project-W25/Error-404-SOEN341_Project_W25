import { Router, Request, Response } from 'express';
import { connectDB } from '../app';  

const router: Router = Router();

router.get('/', (req: Request, res: Response): void => {
    res.send('Welcome to the homepage!');
});

export default router;
