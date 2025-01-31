import { Router } from 'express';
import { getAllTeams, createTeams } from '../controllers/teamsController';

const router: Router = Router();

router.get('/', getAllTeams);
router.post('/', createTeams);

export default router;
