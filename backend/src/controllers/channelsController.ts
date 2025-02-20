import { IChannel } from '@shared/interfaces';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Channel } from '../models/channelsModel';
import { Team } from '../models/teamsModel';
import { User } from '../models/userModel';
import { Conversation } from '../models/conversationsModel';
import { io } from '../app'; 

/**
 * Create a channel
 * @param req creator_id, team_id, channelName, channelDescription
 * @param res channel_id of the created channel
 */
export const createChannel = async (req: Request, res: Response) => {
  const { creator_id, team_id, channelName, channelDescription } = req.body;

  try {
    const team = await Team.findOne({ team_id }); // returns the team object
    if (!team) {
      // if not found
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    const channel_id = uuidv4();
    const conversationId = uuidv4(); // Create a new conversationId

    const isUserInTeam: boolean = team.members.includes(creator_id);

    if (!isUserInTeam) {
      res.status(400).json({
        error: 'You must be a member of the team to create a channel',
      });
      return;
    }

    const newChannel = new Channel({
      channel_id: channel_id,
      name: channelName,
      description: channelDescription,
      team_id: team_id, // associated team
      members: [creator_id], // creator of the channel
      conversationId: conversationId, // Store conversationId
    });

    // If the creator is not an admin, add them to the admin list
    if (!team.admin.includes(creator_id)) {
      newChannel.members.push(...team.admin);
    }

    const savedChannel: IChannel = await newChannel.save();

    // Add the channel to the team
    team.channels.push(savedChannel);
    await team.save();

    // Add the channel to the user's array of teams
    const user = await User.findOne({ user_id: creator_id });
    if (user){

      // Find the team in user.teams array by team_id
      let teamIndex;

      for (let i = 0; i < user.teams.length; i++) {
        if (user.teams[i].team_id === team_id) {
          teamIndex = i;
          break;
        }
      }
      
      if (teamIndex === undefined) {
        res.status(404).json({ error: 'Team not found' });
        return;
      }
        
      user.teams[teamIndex].channels.push(savedChannel);
      await user.save();
      
    }
    
    // Create a new conversation for the channel
    await new Conversation({
      conversationId: conversationId,
      conversationName: channelName,
      messages: [],
    }).save();

    io.to(creator_id).emit('joinRoom', { conversationId });

    res.status(201).json({
      message: 'The channel and conversation has been created successfully',
      channel_id: savedChannel.channel_id,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ error: 'Failed to create channel', details: error.message });
    } else {
      res
        .status(500)
        .json({ error: 'Failed to create channel', details: 'Unknown error' });
    }
  }
};

/**
 * Add a user to a channel
 * @param req team_id, channel_id, user_id
 * @param res success message or error message
 */
export const addUserToChannel = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { team_id, channel_id, user_id } = req.body;

  try {
    const channel = await Channel.findOne({ channel_id }); // get the channel by id
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
    const isUserInTeam: boolean = team.members.includes(user_id);
    if (!isUserInTeam) {
      res
        .status(400)
        .json({ error: 'The user entered is not part of the team' });
      return;
    }

    // Check if the user is part of the channel
    const isUserInChannel: boolean = channel.members.includes(user_id);
    if (isUserInChannel) {
      res
        .status(400)
        .json({ error: 'The user entered is already part of the channel' });
      return;
    }

    // Otherwise, add the user to the members of the channel
    channel.members.push(user_id);

    // Save the channel
    const savedChannel: IChannel = await channel.save();

    // Update the team
    for (let i = 0; i < team.channels.length; i++) {
      if (team.channels[i].channel_id === channel_id) { // find the corresponding channel in the team
        const channelUpdate = team.channels[i];
        channelUpdate.members.push(user_id); // add the user to the channel in the team
        break;
      }
    }

    await team.save();

    // Add the user to the conversation room
    io.to(user_id).emit('joinRoom', { conversationId: channel.conversationId });

    res.status(201).json({
      success: true,
      message: 'The user has been added to the channel and conversation successfully',
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        error: 'Failed to add user to channel',
        details: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to add user to channel',
        details: 'Unknown error',
      });
    }
  }
};

/**
 * Get a channel by its ID
 * @param req team_id, channel_id
 * @param res IChannel object
 */
export const getChannelById = async (req: Request, res: Response) => {
  const { team_id, channel_id } = req.body;
  if (!team_id || !channel_id) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  try {
    const team = await Team.findOne({ team_id });
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    const channel: IChannel | undefined = team.channels.find(
      (c) => c.channel_id === channel_id
    );

    if (!channel) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }

    res.status(200).json({ channel });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ error: 'Failed to get channel', details: error.message });
    } else {
      res
        .status(500)
        .json({ error: 'Failed to get channel', details: 'Unknown error' });
    }
  }
};

/**
 * Remove a member from a channel given the member_id and channel_id
 * @param req member_id, channel_id
 * @param res returns success or error message
 */
export const removeMemberFromChannel = async (req: Request, res: Response) => {
  try {
    const { member_id, channel_id } = req.body;

    const channel = await Channel.findOne({ channel_id });

    if (!channel) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }

    // Remove the user from the members array in the channel object
    if (!channel.members.includes(member_id)) {
      res.status(400).json({
        error: `User with user_id ${member_id} is not a member of the channel`,
      });
      return;
    } else {
      channel.members = channel.members.filter((member) => member !== member_id);
    }

    await channel.save();

    // Remove the user from the members array in the channels array of the teams object
    const team = await Team.findOne({ team_id: channel.team_id });
    if (!team) {
      res.status(404).json({ error: 'Team not found' });  
      return;
    } else {
      team.channels.forEach((channel) => {
        channel.members = channel.members.filter((member) => member !== member_id);
      });
    }

    await team.save();

    // Remove the user from the members array of the channels array that's in the teams array in the user object
    const user = await User.findOne({ user_id: member_id });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    } else {
      user.teams.forEach(team => {
        team.channels.forEach(channel => {
          channel.members = channel.members.filter((member) => member !== member_id);
        });
      });
    }

    await user.save();

    res.json({ success: true });
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({
      success: false,
      error: 'Failed to remove member from channel',
      details: errorMessage,
    });
    console.error('Failed to remove member from channel', errorMessage);
  }
};

  /**
   * Delete a channel from the database
   * @param req channel_id 
   * @param res success message or error message
  */
export const deleteChannel = async (req: Request, res: Response) => {
  try {
    const { channel_id } = req.body;

    const channel = await Channel.findOne({ channel_id });

    if (!channel) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }

    // remove the channel from the user's channels
    for (const member of channel.members) {
      const user = await User.findOne({ user_id: member });
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      user.teams.forEach(team => {
        team.channels = team.channels.filter(c => c.channel_id !== channel_id);
      });

      await user.save();
    }

    // remove the channel from the team's channels
    const t = await Team.findOne({ team_id: channel.team_id });
    if (!t) {
      res.status(404).json({ error: 'Team not found' });
      return;
    } else {
      t.channels = t.channels.filter((c) => c.channel_id !== channel_id);
      await t.save();
    }
    
    // delete the channel from the database
    await channel.deleteOne();
    res.json({ success: true });

  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({
      success: false,
      error: 'Failed to delete channel',
      details: errorMessage,
    });
    console.error('Failed to delete channel', errorMessage);
  }
}
