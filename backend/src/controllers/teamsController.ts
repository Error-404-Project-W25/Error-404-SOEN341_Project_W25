import { Request, Response } from 'express';
import { Team } from '../models/teamsModel';
import { v4 as uuidv4 } from 'uuid';

// Get all teams
export const getAllTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const teams = await Team.find(); 
    console.log('Fetched teams:', teams); 
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching teams' });
  }
};

// Create a new team
export const createTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    // Simulate an authenticated user (use real authentication logic here)
    const authenticatedUser = "testing API";  // Replace with authenticated user's data

    const { team_name } = req.body;

    // Validate required fields
    if (!team_name) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Generate a UUID for the team_id
    const team_id = uuidv4();

    // Create a new team document
    const newTeam = new Team({
      team_id,
      team_name,
      creator: {
        user_id: "1", // Replace with real user ID
        username: authenticatedUser, // Replace with real username
        role: 'admin', // Creator is always admin
      },
      members: [], // No members initially
      channels: [
        {
          channel_name: "General", 
          description: "This is the default channel",
          members: [],
        },
      ],
    });

    const savedTeam = await newTeam.save();
    res.status(201).json(savedTeam);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to create team', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create team', details: 'Unknown error' });
    }
  }
};
