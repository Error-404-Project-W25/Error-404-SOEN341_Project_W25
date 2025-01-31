import { Request, Response } from 'express';
import { Channel } from '../models/channelsModel';
import { Team } from '../models/teamsModel';
import { User, userSchema } from '../models/userModel'; // to add
import { v4 as uuidv4 } from 'uuid';

// Create a new channel 
export const createChannel = async (req: Request, res: Response): Promise<void> => {
    const team_id = req.params; // get team that user is currently in
    const { channelName, channelDescription } = req.body; // get channel info

    try {
        const team = await Team.findById(team_id); // returns the team object
        if (!team) { // if not found
            res.status(404).json({ error: 'Team not found' });
            return;
        } 

        const channel_id = uuidv4(); // unique identifier for channel id

        const newChannel = new Channel({ // make new channel
            id: channel_id,
            name: channelName,
            description: channelDescription,
            team_id: team_id, // associated team
            members: team.admin // admin is default member
        });

        const savedChannel = await newChannel.save();
        res.status(201).json({
            message: 'The channel has been created successfully'
        });

    } catch (error: unknown) {
        if (error instanceof Error) {
          res.status(500).json({ error: 'Failed to create channel', details: error.message });
        } else {
          res.status(500).json({ error: 'Failed to create channel', details: 'Unknown error' });
        }
      }

}

// Add users to a channel
export const addUserToChannel = async (req: Request, res: Response): Promise<void> => {
    const channel_id = req.params; // get channel id that user is currently in
    const user_id = req.body; // get name of the user to add
    const team_id = req.params; // get team that user is currently in

    try {
        const channel = Channel.findById(channel_id); // get the channel
        const team = Team.findById(team_id); // get the team
        
        // check if the user is part of the team
        if (!team.members.includes(user_id)) {
            res.status(400).json({ error: 'The user entered is not part of the team' });
            return;
        }

        // check if the user is part of the channel
        if (channel.members.includes(user_id)) {
            res.status(400).json({ error: 'The user entered is already part of the channel' });
            return;
        }

        // otherwise, add the user to the members of the channel
        channel.members.push(user_id);
        res.status(201).json({
            message: 'The user has been added to the channel successfully'
        });

    } catch (error: unknown) {
        if (error instanceof Error) {
          res.status(500).json({ error: 'Failed to create channel', details: error.message });
        } else {
          res.status(500).json({ error: 'Failed to create channel', details: 'Unknown error' });
        }
      }
}