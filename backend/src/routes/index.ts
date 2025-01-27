import { Router, Request, Response } from 'express';

const router: Router = Router();

router.get('/', (req: Request, res: Response): void => {
    res.send('Welcome to the homepage!');
});

export default router;
