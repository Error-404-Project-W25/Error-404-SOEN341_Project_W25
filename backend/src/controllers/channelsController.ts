import { IChannel } from '@shared/interfaces';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Channel } from '../models/channelsModel';
import { Team } from '../models/teamsModel';

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

    const isUserInTeam: boolean = team.members.includes(creator_id);

    if (!isUserInTeam) {
      res.status(400).json({
        error: 'You must be a member of the team to create a channel',
      });
      return;
    }

    const newChannel = new Channel({
      id: channel_id,
      name: channelName,
      description: channelDescription,
      team: team_id, // associated team
      members: [creator_id], // creator of the channel
    });

    // If the creator is not an admin, add them to the admin list
    if (!team.admin.includes(creator_id)) {
      newChannel.members.push(...team.admin);
    }

    const savedChannel: IChannel = await newChannel.save();

    // Add the channel to the team
    team.channels.push(savedChannel);
    await team.save();

    res.status(201).json({
      message: 'The channel has been created successfully',
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
    const isUserInTeam: boolean = team.members.includes(user_id);
    if (!isUserInTeam) {
      res
        .status(400)
        .json({ error: 'The user entered is not part of the team' });
      return;
    }

    // Check if the user is part of the channel
    const isUserInChannel: boolean = channel.members.includes(user_id);
    if (!isUserInChannel) {
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
    team.channels.push(savedChannel);
    await team.save();

    res.status(201).json({
      success: true,
      message: 'The user has been added to the channel successfully',
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
      (channel) => channel.channel_id === channel_id
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
