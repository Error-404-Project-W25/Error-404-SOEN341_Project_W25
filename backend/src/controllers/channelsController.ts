import { Request, Response } from 'express';
import { Channel } from '../models/channelsModel';
import { Team } from '../models/teamsModel';
import { User, userSchema } from '../models/userModel';
import { v4 as uuidv4 } from 'uuid';

// Create a new channel 
export const createChannel = async (req: Request, res: Response) => {
    try {
        const { channelName, channelDescription, team_id, user_id } = req.body; // get channel info
        
        if (!channelName || !channelDescription || !team_id || !user_id) {
          res.status(400).json({ error: 'Missing required fields' });
          return;
        }

        const team = await Team.findOne({ team_id });
        if (!team) {
          res.status(404).json({ error: 'Team not found' });
          return;
        }

        const channel_id = uuidv4(); // unique identifier for channel id

        const newChannel = new Channel({ // make new channel
            channel_id: channel_id,
            channel_name: channelName,
            channel_description: channelDescription,
            team_id: team_id, // associated team
            members: [user_id] // user that made the channel
        });

        const savedChannel = await newChannel.save();
        res.status(201).json(savedChannel);

    } catch (error) {
      const errorMessage = (error as Error).message;
      res.status(500).json({ error: 'Failed to create channel', details: errorMessage });
      console.error('Failed to create channel:', errorMessage);
    } 

}

// Add users to a channel
export const addUserToChannel = async (req: Request, res: Response) => {

    try {
        const { channel_id, user_id, team_id } = req.body; // get info

        // check if the user is part of the team
        const team = await Team.findOne({ team_id });
        if (team && !team.members.includes(user_id)) {
          res.status(400).json({ error: 'The user entered is not part of the team' });
          return;
        }

        // check if the user is part of the channel
        const channel = await Channel.findOne({ channel_id });
        if (channel && channel.members.includes(user_id)) {
          res.status(400).json({ error: 'The user entered is already part of the channel' });
          return;
        }

        // otherwise, add the user to the members of the channel
        if (channel) {
          channel.members.push(user_id);
          const updatedChannel = await channel.save();
          res.json(updatedChannel);
        } else {
          res.status(404).json({ error: 'Channel not found' });
        }

    } catch (error) {
      const errorMessage = (error as Error).message;
      res.status(500).json({ error: 'Failed to add user to channel', details: errorMessage });
      console.error('Failed to add user to channel:', errorMessage);
    }
}