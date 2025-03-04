import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ITeam } from '@shared/interfaces';
import { Team } from '../models/teamsModel';
import { User } from '../models/userModel';

/**
 * Get all teams in the database
 * @param req user_id
 * @param res returns all teams of which the user is a member
 */
export const getUserTeams = async (req: Request, res: Response) => {
  try {
    const userIdQuery: string = req.params.user_id;
    const teams: ITeam[] | null = await Team.find({
      members: userIdQuery,
    });
    res.json({ teams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Error fetching teams' });
  }
};

/**
 * Get a team by team_id
 * @param req team_id
 * @param res returns an ITeam object
 */
export const getTeamById = async (req: Request, res: Response) => {
  try {
    const team_id: string = req.params.team_id;
    const team: ITeam | null = await Team.findOne({ team_id });
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }
    res.status(200).json({ team });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Error fetching team' });
  }
};

/**
 * Create a new team
 * @param req user_id, team_name, description, members
 * @param res returns the new ITeam's id
 */
export const createTeam = async (req: Request, res: Response) => {
  try {
    const { user_id, team_name, description } = req.body;

    // Generate a UUID for the team_id
    const team_id: string = uuidv4();
    const conversation_id: string = uuidv4();

    // Create a new team document
    const newTeam: ITeam = await new Team({
      team_id,
      team_name,
      description,
      admin: [user_id],
      members: [user_id],
      channels: [
        {
          channel_id: uuidv4(),
          name: 'General',
          description: 'This is the default channel',
          team_id: team_id,
          members: [user_id], // Add the creator to the default channel members
          conversationId: conversation_id,
        },
      ],
    }).save();

    // Add the new ITeam to the signed-in user
    const user = await User.findOne({ user_id });
    if (user) {
      if (user.teams) {
        user.teams.push(newTeam);
      } else {
        user.teams = [newTeam];
      }
      await user.save();
    }

    res.status(201).json({ team_id });
  } catch (error) {
    const errorMessage: string = (error as Error).message;
    res
      .status(500)
      .json({ error: 'Failed to create team', details: errorMessage });
    console.error('Failed to create team:', errorMessage);
  }
};

/**
 * Add a member to a team given the member_id and team_id
 * @param req member_id, team_id
 * @param res returns success or error message
 */
export const addMemberToTeam = async (req: Request, res: Response) => {
  try {
    const { member_id, team_id } = req.body;

    // Find the team by team_id
    const team = await Team.findOne({ team_id });
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    if (team.members.includes(member_id)) {
      res.status(400).json({
        error: `User with user_id ${member_id} is already a member of the team`,
      });
      return;
    } else {
      team.members.push(member_id);
    }

    const updatedTeam: ITeam = await team.save();

    const memberToAdd = await User.findOne({ user_id: member_id });
    if (!memberToAdd) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    memberToAdd.teams.push(updatedTeam);
    await memberToAdd.save();

    res.json({ success: true });
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({
      success: false,
      error: 'Failed to add member to team',
      details: errorMessage,
    });
    console.error('Failed to add member to team:', errorMessage);
  }
};

/**
 * Remove a member from a team given the member_id and team_id
 * @param req member_id, team_id
 * @param res returns success or error message
 */
export const removeMemberFromTeam = async (req: Request, res: Response) => {
  try {
    const { member_id, team_id } = req.body;

    const team = await Team.findOne({ team_id });

    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    } 

    if (!team.members.includes(member_id)) {
      res.status(400).json({
        error: `User with user_id ${member_id} is not a member of the team`,
      });
      return;
    } else {    
      team.members = team.members.filter((member) => member !== member_id);
    }   

    await team.save();

    // Remove the team from the user's teams 
    const user = await User.findOne({ user_id: member_id });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    } else {    
      user.teams = user.teams.filter((team) => team !== team_id);
    }   

    await user.save();
    res.json({ success: true });

  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({
      success: false,
      error: 'Failed to remove member from team',
      details: errorMessage,
    });
    console.error('Failed to remove member from team', errorMessage);
  }

};

/**
 * Delete a team from the database
 * @param req team_name
 * @param res returns success or error message
 */
export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const { team_name } = req.body;

    const team = await Team.findOne({ team_name });
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }   

    // remove the team from all its members teams
    for (const member of team.members) {
      const user = await User.findOne({ user_id: member });
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
        
      user.teams = user.teams.filter((team) => team.team_id !== team_name.team_id);
      
      await user.save();
    }

    // delete the team from the database
    await team.deleteOne();
    res.json({ success: true });

  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({
      success: false,
      error: 'Failed to delete team',
      details: errorMessage,
    });
    console.error('Failed to delete team:', errorMessage);
  }
}