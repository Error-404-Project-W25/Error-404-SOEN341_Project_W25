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
 * @param req creatorId, teamId, channelName, channelDescription
 * @param res channelId of the created channel
 */
export const createChannel = async (req: Request, res: Response) => {
  const { creatorId, teamId, channelName, channelDescription } = req.body;

  try {
    const team = await Team.findOne({ teamId }); // returns the team object
    if (!team) {
      // if not found
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    const channelId = uuidv4();
    const conversationId = uuidv4(); // Create a new conversationId

    const isUserInTeam: boolean = team.members.includes(creatorId);

    if (!isUserInTeam) {
      res.status(400).json({
        error: 'You must be a member of the team to create a channel',
      });
      return;
    }

    const newChannel = new Channel({
      channelId: channelId,
      name: channelName,
      description: channelDescription,
      teamId: teamId, // associated team
      members: [creatorId], // creator of the channel
      conversationId: conversationId, // Store conversationId
    });

    // If the creator is not an admin, add them to the admin list
    if (!team.admin.includes(creatorId)) {
      newChannel.members.push(...team.admin);
    }

    const savedChannel: IChannel = await newChannel.save();

    // Add the channel to the team
    team.channels.push(savedChannel.channelId);
    await team.save();

    const user = await User.findOne({ userId: creatorId });
    if (user && user.teams) {
      // Find the team by teamId
      const teamIndex: number = user.teams.findIndex((team) => team === teamId);

      if (teamIndex === -1) {
        res.status(404).json({ error: 'Team not found' });
        return;
      }

      // Add the channel ID to the user's team
      user.teams[teamIndex] = teamId;

      await user.save();
    }

    // Create a new conversation for the channel
    await new Conversation({
      conversationId: conversationId,
      conversationName: channelName,
      messages: [],
    }).save();

    io.to(creatorId).emit('joinRoom', { conversationId });

    res.status(201).json({
      message: 'The channel and conversation has been created successfully',
      channelId: savedChannel.channelId,
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
 * Create a general channel for a team
 * @param teamId, creatorId
 * @returns channelId of the created channel
 */
export const createGeneralChannel = async (
  teamId: string,
  creatorId: string
): Promise<string | null> => {
  try {
    const channelId = uuidv4();
    const conversationId = uuidv4(); // Create a new conversationId

    const newChannel = new Channel({
      channelId: channelId,
      name: 'General',
      description: 'This is the default channel',
      teamId: teamId, // associated team
      members: [creatorId], // creator of the channel
      conversationId: conversationId, // Store conversationId
    });

    const savedChannel: IChannel = await newChannel.save();

    // Add the channel to the team
    const team = await Team.findOne({ teamId });
    if (team) {
      team.channels.push(savedChannel.channelId);
      await team.save();
    }

    // Create a new conversation for the channel
    await new Conversation({
      conversationId: conversationId,
      conversationName: 'General',
      messages: [],
    }).save();

    io.to(creatorId).emit('joinRoom', { conversationId });

    return savedChannel.channelId;
  } catch (error: unknown) {
    console.error('Failed to create general channel:', error);
    return null;
  }
};

/**
 * Add a user to a channel
 * @param req teamId, channelId, userId
 * @param res success message or error message
 */
export const addUserToChannel = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { teamId, channelId, userId } = req.body;

  try {
    const channel = await Channel.findOne({ channelId }); // get the channel by id
    if (!channel) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }

    const team = await Team.findOne({ teamId }); // get the team by teamId
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    // Check if the user is part of the team
    const isUserInTeam: boolean = team.members.includes(userId);
    if (!isUserInTeam) {
      res
        .status(400)
        .json({ error: 'The user entered is not part of the team' });
      return;
    }

    // Check if the user is part of the channel
    const isUserInChannel: boolean = channel.members.includes(userId);
    if (isUserInChannel) {
      res
        .status(400)
        .json({ error: 'The user entered is already part of the channel' });
      return;
    }

    // Otherwise, add the user to the members of the channel
    channel.members.push(userId);

    // Save the channel
    const savedChannel: IChannel = await channel.save();

    // Add the user to the conversation room
    io.to(userId).emit('joinRoom', { conversationId: channel.conversationId });

    res.status(201).json({
      success: true,
      message:
        'The user has been added to the channel and conversation successfully',
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
 * @param req teamId, channelId
 * @param res IChannel object
 */
export const getChannelById = async (req: Request, res: Response) => {
  const { teamId, channelId } = req.body;
  if (!teamId || !channelId) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  try {
    const team = await Team.findOne({ teamId });
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    const channel: IChannel | null | undefined = await Channel.findOne({
      channelId,
    });

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
 * Remove a member from a channel given the memberId and channelId
 * @param req memberId, channelId
 * @param res returns success or error message
 */
export const removeMemberFromChannel = async (req: Request, res: Response) => {
  try {
    const { memberId, channelId } = req.body;

    const channel = await Channel.findOne({ channelId });

    if (!channel) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }

    // Remove the user from the members array in the channel object
    if (!channel.members.includes(memberId)) {
      res.status(400).json({
        error: `User with user ID ${memberId} is not a member of the channel`,
      });
      return;
    } else {
      channel.members = channel.members.filter((member) => member !== memberId);
    }

    await channel.save();

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
 * @param req channelId
 * @param res success message or error message
 */
export const deleteChannel = async (req: Request, res: Response) => {
  try {
    const { channelId } = req.body;

    const channel = await Channel.findOne({ channelId });

    if (!channel) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }

    // remove the channel from the team's channels
    const t = await Team.findOne({ teamId: channel.teamId });
    if (!t) {
      res.status(404).json({ error: 'Team not found' });
      return;
    } else {
      t.channels = t.channels.filter((c) => c !== channelId);
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
};
