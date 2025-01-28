// 5 LINES TO UNCOMMENT MISSING USER FROM FIREBASE
import { Request, Response } from 'express';
import { Team } from '../models/teamsModel'; 

// Get all teams
export const getAllTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const teams = await Team.find(); 
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching teams' });
  }
};

export const createTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    //get from request
    //const authenticatedUser = req.user; UNCOMMENT

    const { team_id, team_name } = req.body;

    // Validate required fields
    if (!team_id || !team_name) {
      //return res.status(400).json({ error: 'Missing required fields' }); UNCOMMENT
    }

    // Create a new team document
    const newTeam = new Team({
      team_id,
      team_name,
      creator: {
        //user_id: authenticatedUser.user_id, UNCOMMENT
        //username: authenticatedUser.username,
        role: 'admin', //creator always admin
      },
      members: [], // No members initially
    });

    const savedTeam = await newTeam.save();
    res.status(201).json(savedTeam);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create team', details: "get error idk from where yet" }); // FIND
  }
};
