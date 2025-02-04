import { Router } from 'express';
import { getAllTeams, getTeamByName, createTeams, addMemberToTeam} from '../controllers/teamsController';

const router: Router = Router();

router.get('/', getAllTeams);
router.get('/getTeamByName', getTeamByName);
router.post('/create', createTeams);
router.post('/addMember', addMemberToTeam);

export default router;
