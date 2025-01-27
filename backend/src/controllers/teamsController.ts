import { Request, Response } from 'express';

interface Team {
  id: number;
  name: string;
}

const teams: Team[] = [{ id: 1, name: 'John Doe' }];

export const getAllTeams = (req: Request, res: Response): void => {
  res.json(teams);
};

export const createTeams = (req: Request, res: Response): void => {
  const newTeam: Team = req.body;
  teams.push(newTeam);
  res.status(201).json(newTeam);
};
