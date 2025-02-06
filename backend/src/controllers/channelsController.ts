import { Request, Response } from 'express';
import { Channel } from '../models/channelsModel';
import { Team } from '../models/teamsModel';
import { User } from '../models/userModel';
import { v4 as uuidv4 } from 'uuid';

// Create a new channel 
export const createChannel = async (req: Request, res: Response): Promise<void> => {
    const { team_id, creator_id, channelName, channelDescription } = req.body; // get channel info

    try {
        const team = await Team.findOne({team_id}); // returns the team object
        if (!team) { // if not found
            res.status(404).json({ error: 'Team not found' });
            return;
        } 

        console.log('team: ' + team.team_name);

        const channel_id = uuidv4(); // unique identifier for channel id

        // Check if the creator is part of the team
        const userInTeam = team.members.find(members => members === creator_id);
        console.log('userInTeam: ' + userInTeam);
        if (!userInTeam) {
            res.status(400).json({ error: 'You must be a member of the team to create a channel' });
        return;
        }
        
        const newChannel = new Channel({ // make new channel
            id: channel_id,
            name: channelName,
            description: channelDescription,
            team: team_id, // associated team
            members: [creator_id] // initalize members with the user that created the channel
        });

        
        // if creator of channel is not admin of team, add admin to members list
        if (creator_id != team.admin.toString()) {
            newChannel.members.push(team.admin.toString());
        }
            

        const savedChannel = await newChannel.save();
        team.channels.push(savedChannel); // add channel to team
        await team.save();


        res.status(201).json({
            message: 'The channel has been created successfully',
            channel: savedChannel
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
    const {team_id, channel_id, user_id } = req.body; // get user_id from the request body

    try {
        
        const channel = await Channel.findOne({ id: channel_id }); // get the channel by id
        if (!channel) {
            res.status(404).json({ error: 'Channel not found' });
            return;
        }
            

        const team = await Team.findOne({ team_id }); // get the team by team_id
        if (!team) {
            res.status(404).json({ error: 'Team not found' });
            return;
        }

        // Check if the user is part of the team
        const userInTeam = team.members.find((member) => member === user_id);
        if (!userInTeam) {
            res.status(400).json({ error: 'The user entered is not part of the team' });
            return;
        }

        // Check if the user is part of the channel
        const userInChannel = channel.members.find((member) => member === user_id);
        if (userInChannel) {
            res.status(400).json({ error: 'The user entered is already part of the channel' });
            return;
        }

        // Otherwise, add the user to the members of the channel
        channel.members.push(userInTeam);
        const savedChannel = await channel.save();
        // add member to the teams.channels.members
        team.channels.find((teamChannel) => teamChannel.id === channel_id)?.members.push(userInTeam);
        await team.save();
        res.status(201).json({
            message: 'The user has been added to the channel successfully',
            channel: savedChannel
        });

        //add channel to the user given in the request
        

    } catch (error: unknown) {
        if (error instanceof Error) {
          res.status(500).json({ error: 'Failed to add user to channel', details: error.message });
        } else {
          res.status(500).json({ error: 'Failed to add user to channel', details: 'Unknown error' });
        }
      }
}

// get channel by channel_id
export const getChannelById = async (req: Request, res: Response): Promise<void> => {
    const { team_id, channel_id } = req.body; // get channel_id, team_id from params
    if (!team_id || !channel_id) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }
    try {
        const team = await Team.findOne({ team_id }); // get the team by team_id    
        if (!team) {
            res.status(404).json({ error: 'Team not found' });
            return;
        }
        const channel = team.channels.find((channel) => channel.id === channel_id); // find the channel by id
        if (!channel) {
            res.status(404).json({ error: 'Channel not found' });
            return;
        }
        res.status(200).json(channel); // return the channel
    } catch (error: unknown) {
        if (error instanceof Error) {
          res.status(500).json({ error: 'Failed to get channel', details: error.message });
        } else {
          res.status(500).json({ error: 'Failed to get channel', details: 'Unknown error' });
        }
      }
}