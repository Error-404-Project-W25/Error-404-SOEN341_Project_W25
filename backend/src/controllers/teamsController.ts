// 5 LINES TO UNCOMMENT MISSING USER FROM FIREBASE
import { Request, Response } from 'express';
import { Team } from '../models/teamsModel'; 

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

export const createTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    //get from request
    //const authenticatedUser = req.user; UNCOMMENT
    const authenticatedUser = "testing API"

    const { team_id, team_name } = req.body;

  
    // Validate required fields
    if (!team_id || !team_name) {
      res.status(400).json({ error: 'Missing required fields' }); 
      return;
    }

    // Create a new team document
    const newTeam = new Team({
      team_id,
      team_name,
      creator: {
        user_id: "1", 
        username: authenticatedUser, 
        //user_id: authenticatedUser.user_id, UNCOMMENT
        //username: authenticatedUser.username,
        role: 'admin', //creator always admin
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
