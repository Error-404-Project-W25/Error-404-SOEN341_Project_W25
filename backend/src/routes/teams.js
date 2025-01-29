import { Router } from 'express';
import { getAllTeams, createTeams } from '../controllers/teamsController.js';

const router = Router();

router.get('/', getAllTeams);
router.post('/', createTeams);

export default router;
