const teams = [{ id: 1, name: 'John Doe' }];

export const getAllTeams = (req, res) => {
    res.json(teams);
};

export const createTeams = (req, res) => {
    const newTeam = req.body;
    users.push(newTeam);
    res.status(201).json(newTeam);
};
