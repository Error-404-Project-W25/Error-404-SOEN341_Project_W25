import { Router } from 'express';
import {
  getUserTeams,
  getTeamById,
  createTeam,
  addMemberToTeam,
} from '../controllers/teamsController';

const router: Router = Router();

router.get('/user/:user_id', getUserTeams);
router.get('/getTeamById/:team_id', getTeamById);
router.post('/create', createTeam);
router.post('/addMember', addMemberToTeam);

export default router;
