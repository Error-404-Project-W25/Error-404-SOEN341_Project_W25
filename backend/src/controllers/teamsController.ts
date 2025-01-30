import { Request, Response } from 'express';
import { Team } from '../models/teamsModel';
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

// Create a new team
export const createTeams = async (req: Request, res: Response) => {
  try {
    const { user_id, username, email, team_name, description } = req.body;

    // Validate required fields
    if (!team_name || !description || !user_id || !username || !email) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Generate a UUID for the team_id
    const team_id = uuidv4();

    // Create a new team document
    const newTeam = new Team({
      team_id,
      team_name,
      admin: [{
        user_id: user_id,
        username: username,
        email: email,
        role: 'admin', // Creator is always admin
      }],
      members: [{
        user_id: user_id,
        username: username,
        email: email,
        role: 'admin', // Add the creator as a member with admin role
      }],
      channels: [
        {
          id: uuidv4(),
          name: "General", 
          description: "This is the default channel",
          team: team_id, 
          members: [{
            user_id: user_id,
            username: username,
            email: email,
            role: 'admin', // Add the creator to the default channel members
          }],
        },
      ],
      created_at: new Date(),
    });

    const savedTeam = await newTeam.save();
    res.status(201).json(savedTeam);
  } catch (error) {
      const errorMessage = (error as Error).message;
      res.status(500).json({ error: 'Failed to create team', details: errorMessage });
      console.error('Failed to create team:', errorMessage);
  }
};