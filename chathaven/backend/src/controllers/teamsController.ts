import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ITeam } from '@shared/interfaces';
import { Team } from '../models/teamsModel';
import { User } from '../models/userModel';
import { createGeneralChannel } from './channelsController';

/**
 * Get all teams in the database
 * @param req userId
 * @param res returns all teams of which the user is a member
 */
export const getUserTeams = async (req: Request, res: Response) => {
  try {
    const userIdQuery: string = req.params.userId;
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
 * Get a team by teamId
 * @param req teamId
 * @param res returns an ITeam object
 */
export const getTeamById = async (req: Request, res: Response) => {
  try {
    const teamId: string = req.params.teamId;
    const team: ITeam | null = await Team.findOne({ teamId });
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
 * @param req userId, teamName, description, members
 * @param res returns the new ITeam's id
 */
export const createTeam = async (req: Request, res: Response) => {
  try {
    const { userId, teamName, description } = req.body;

    // Generate a UUID for the teamId
    const teamId: string = uuidv4();

    // Create a general channel for the team
    const generalChannelId = await createGeneralChannel(teamId, userId);

    // Create a new team document
    const newTeam: ITeam = await new Team({
      teamId,
      teamName,
      description,
      admin: [userId],
      members: [userId],
      channels: [generalChannelId],
    }).save();

    // Add the new team ID to the signed-in user
    const user = await User.findOne({ userId: userId });
    if (user) {
      if (user.teams) {
        user.teams.push(newTeam.teamId);
      } else {
        user.teams = [newTeam.teamId];
      }
      await user.save();
    }

    res.status(201).json({ teamId });
  } catch (error) {
    const errorMessage: string = (error as Error).message;
    res
      .status(500)
      .json({ error: 'Failed to create team', details: errorMessage });
    console.error('Failed to create team:', errorMessage);
  }
};

/**
 * Add a member to a team given the memberId and teamId
 * @param req memberId, teamId
 * @param res returns success or error message
 */
export const addMemberToTeam = async (req: Request, res: Response) => {
  try {
    const { memberId, teamId } = req.body;

    // Find the team by teamId
    const team = await Team.findOne({ teamId });
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    if (team.members.includes(memberId)) {
      res.status(400).json({
        error: `User with userId ${memberId} is already a member of the team`,
      });
      return;
    } else {
      team.members.push(memberId);
    }

    const updatedTeam: ITeam = await team.save();

    const memberToAdd = await User.findOne({ userId: memberId });
    if (!memberToAdd) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    memberToAdd.teams.push(updatedTeam.teamId);
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
 * Remove a member from a team given the memberId and teamId
 * @param req memberId, teamId
 * @param res returns success or error message
 */
export const removeMemberFromTeam = async (req: Request, res: Response) => {
  try {
    const { memberId, teamId } = req.body;

    const team = await Team.findOne({ teamId });

    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    if (!team.members.includes(memberId)) {
      res.status(400).json({
        error: `User with userId ${memberId} is not a member of the team`,
      });
      return;
    } else {
      team.members = team.members.filter(
        (member: string) => member !== memberId
      );
    }

    await team.save();

    // Remove the team ID from the user's teams
    const user = await User.findOne({ userId: memberId });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    } else {
      user.teams = user.teams.filter((team: string) => team !== teamId);
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
 * @param req teamId
 * @param res returns success or error message
 */
export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.body;

    const team = await Team.findOne({ teamId });
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    // remove the team from all its members teams
    for (const member of team.members) {
      const user = await User.findOne({ userId: member });
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      user.teams = user.teams.filter((team: string) => team !== teamId);

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
};
