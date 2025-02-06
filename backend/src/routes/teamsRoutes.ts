import { Router } from 'express';
import { getAllTeams, getTeamById, createTeams, addMemberToTeam} from '../controllers/teamsController';

const router: Router = Router();

router.get('/', getAllTeams);
router.get('/getTeamById/:team_id', getTeamById); 
router.post('/create', createTeams);
router.post('/addMember', addMemberToTeam);

export default router;
