import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ITeam, IChannel } from '@shared/interfaces';
import { Team } from '../models/teamsModel';
import { User } from '../models/userModel';
import { Channel } from '../models/channelsModel'; // Import the Channel model

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

    // Generate a UUID for the default channel
    const channel_id: string = uuidv4();

    // Create a new default channel document
    const defaultChannel: IChannel = await new Channel({
      channel_id,
      name: 'General',
      description: 'This is the default channel',
      team_id,
      members: [user_id],
    }).save();

    // Create a new team document
    const newTeam: ITeam = await new Team({
      team_id,
      team_name,
      description,
      admin: [user_id],
      members: [user_id],
      channels: [defaultChannel.channel_id], // Add the default channel ID
    }).save();

    // Add the new ITeam ID to the signed-in user
    const user = await User.findOne({ user_id });
    if (user) {
      user.teams.push(newTeam.team_id);
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

    await team.save();

    const memberToAdd = await User.findOne({ user_id: member_id });
    if (!memberToAdd) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    memberToAdd.teams.push(team_id);
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
 * @param req team_id
 * @param res returns success or error message
 */
export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const { team_id } = req.body;
    const team = await Team.findOne({ team_id });
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }
    //remove team from all users
    const users = await User.find({ teams: team_id });
    users.forEach(async (user) => {
      user.teams = user.teams.filter((team) => team !== team_id);
      await user.save();
    });
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

};