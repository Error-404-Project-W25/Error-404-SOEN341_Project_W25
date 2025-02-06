import { Request, Response } from 'express';
import { Team } from '../models/teamsModel';
import { User } from '../models/userModel';
import { v4 as uuidv4 } from 'uuid';
import { IUser } from '../../../shared/interfaces';

// Get all teams
export const getAllTeams = async (req: Request, res: Response) => {
  try {
    const teams = await Team.find();
    console.log('Fetched teams:', teams);
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching teams' });
  }
};

export const getTeamById = async (req: Request, res: Response) => {
  try {
    const { team_id } = req.params; // 
    const team = await Team.findOne({ team_id });
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching team' });
  }
};

// Create a new team
export const createTeams = async (req: Request, res: Response) => {
  try {
    const { user_id, username, team_name, description, members, role } = req.body;

    if (role !== 'admin') {
      res.status(400).json({ error: 'Invalid role, not allowed to create a team' });
      return;
    }

    // Validate required fields
    if (!team_name || !description || !user_id || !username || !role) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Generate a UUID for the team_id
    const team_id = uuidv4();

    // Create a new team document
    const newTeam = new Team({
      team_id,
      team_name,
      description,
      admin: [user_id], 
      members: [user_id], 
      channels: [
        {
          id: uuidv4(),
          name: 'General',
          description: 'This is the default channel',
          team: team_id,
          members: [user_id], // Add the creator to the default channel members
        },
      ],
      created_at: new Date(),
    });

    // Add additional members if provided
    if (members && Array.isArray(members)) {
      members.forEach((member: IUser) => {
        newTeam.members.push(member.user_id);
        newTeam.channels[0].members.push(member.user_id); 
      });
    }

    const savedTeam = await newTeam.save();

    // Add the newly created team to the user's teams array
    const user = await User.findOne({ user_id });
    if (user) {
      if (user.teams) {
        user.teams.push(savedTeam); 
      } else {
        user.teams = [savedTeam]; 
      }
      await user.save();
    }

    res.status(201).json(savedTeam);

  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: 'Failed to create team', details: errorMessage });
    console.error('Failed to create team:', errorMessage);
  }
};
// Add a member to a team

export const addMemberToTeam = async (req: Request, res: Response) => {
  try {
    const { team_id, members } = req.body;

    // Validate required fields
    if (!team_id || !members) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Find the team by team_id
    const team = await Team.findOne({ team_id });
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }


    // Check if any of the users are already members of the team
    for (const member of members) {
      const existingMember = team.members.find(
        (m) => m === member.user_id
      );
      if (existingMember) {
        res.status(400).json({
          error: `User with user_id ${member.user_id} is already a member of the team`,
        });
        return;
      }
    }

    // Add the new members to the team
    members.forEach((member: string) => {
      
      team.members.push(member);
      console.log('member user id: ' + member);

      team.channels[0].members.push(member);
    });

    const updatedTeam = await team.save();
    // Add the team to the users
    members.forEach(async (member: IUser) => {
      const user = await User.findOne({ user_id: member.user_id });
      if (user) {
        if (user.teams) {
          user.teams.push(updatedTeam);
        } else {
          user.teams = [updatedTeam];
        }
        await user.save();
      }
    });
    res.json(updatedTeam);
  } catch (error) {
    const errorMessage = (error as Error).message;
    res
      .status(500)
      .json({ error: 'Failed to add member to team', details: errorMessage });
    console.error('Failed to add member to team:', errorMessage);
  }
};

