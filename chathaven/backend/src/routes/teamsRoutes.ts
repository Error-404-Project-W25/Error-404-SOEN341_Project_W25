import { Router } from 'express';
import {
  getUserTeams,
  getTeamById,
  createTeam,
  addMemberToTeam,
  removeMemberFromTeam,
  deleteTeam,
} from '../controllers/teamsController';

const router: Router = Router();

router.get('/user/:userId', getUserTeams);
router.get('/getTeamById/:teamId', getTeamById);
router.post('/create', createTeam);
router.post('/addMember', addMemberToTeam);
router.post('/removeMember', removeMemberFromTeam);
router.delete('/delete', deleteTeam);

export default router;
