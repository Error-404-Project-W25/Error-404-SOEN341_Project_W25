import { Router } from 'express';
import { getAllTeams, getTeamById, createTeams, addMemberToTeam} from '../controllers/teamsController';

const router: Router = Router();

router.get('/', getAllTeams);
router.post('/getTeamById', getTeamById); 
router.post('/create', createTeams);
router.post('/addMember', addMemberToTeam);

export default router;
