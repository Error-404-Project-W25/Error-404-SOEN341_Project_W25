import { Request, Response } from 'express';
import { Team } from '../models/teamsModel';
import { IUser } from '../models/userModel';
import { v4 as uuidv4 } from 'uuid';

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
    const {team_id} = req.body
    const team = await Team.findOne({ team_id: team_id });
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }
    res.json(team);
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: 'Failed to get team', details: errorMessage });
    console.error('Failed to get team:', errorMessage);
  }
}; 

// Create a new team
export const createTeams = async (req: Request, res: Response) => {
  try {
    const { user_id, username, team_name, description, members, role } = req.body;

    // Validate required fields
    if (!team_name || !description || !user_id || !username || !role) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (role !== 'admin') {
      res.status(400).json({ error: 'Invalid role, not allowed to create a team' });
      return;
    }

    // Generate a UUID for the team_id
    const team_id = uuidv4();

    // Create a new team document
    const newTeam = new Team({
      team_id,
      team_name,
      admin: [{
        user_id,
        username,
        role: 'admin', // Creator is always admin
      }],
      members: [{
        user_id,
        role: 'admin', // Add the creator as a member with admin role
      }],
      channels: [
        {
          id: uuidv4(),
          name: "General", 
          description: "This is the default channel",
          team: team_id, 
          members: [{
            user_id,
            username,
            role: 'admin', // Add the creator to the default channel members
          }],
        },
      ],
      description,
      created_at: new Date(),
    });

    // Add additional members if provided
    if (members && Array.isArray(members)) {
      members.forEach((member: IUser) => {
        newTeam.members.push(member);
        newTeam.channels[0].members.push(member); 
      });
    }

    const savedTeam = await newTeam.save();
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
      const existingMember = team.members.find((m) => m.user_id === member.user_id);
      if (existingMember) {
        res.status(400).json({ error: `User with user_id ${member.user_id} is already a member of the team` });
        return;
      }
    }

    // Add the new members to the team
    members.forEach((member: IUser) => {
      if (member.role !== 'admin' && member.role !== 'user') {
        console.log ('Invalid role:', member.role);
        member.role = 'user'; // Default role
      }
      console.log ("member role: " + member.role);
      team.members.push({
        user_id: member.user_id,
        username: member.username,
        role: member.role,
      });

      team.channels[0].members.push({
        user_id: member.user_id,
        username: member.username,
        role: member.role,
      }); 
    });

    const updatedTeam = await team.save();
    res.json(updatedTeam);
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: 'Failed to add member to team', details: errorMessage });
    console.error('Failed to add member to team:', errorMessage);
  }
};