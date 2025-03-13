import { Request, Response } from 'express';
import { Channel } from '../models/channelsModel';
import { Team } from '../models/teamsModel';
import { createSession } from 'better-sse';
import { IChannel, ITeam } from '@shared/interfaces';
import { User } from '../models/userModel';

/**
 * Watch for user being added to new Team in the database
 * Send the new ITeam to the client via SSE
 *
 * @param req userId
 */
export const addedToTeamListener = async (req: Request, res: Response) => {
  try {
    const userId: string = req.body.userId;
    const session = await createSession(req, res);

    const pipeline = [{ $match: { 'fullDocument.members': userId } }]; // Look for the userId in the members array

    Team.watch(pipeline, { fullDocument: 'updateLookup' }).on(
      'change',
      (data) => {
        const teamData: ITeam = data.fullDocument as ITeam;
        session.push({
          newTeam: JSON.stringify(teamData),
        });
      }
    );
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({
      error: 'Failed to listen to Team changes',
      details: errorMessage,
    });
  }
};

/**
 * Watch for changes to the user's Channels in the database
 * Send the new IChannel to the client via SSE
 *
 * @param req userId
 */
export const addedToChannelListener = async (req: Request, res: Response) => {
  try {
    const userId: string = req.body.userId;
    const session = await createSession(req, res);

    const pipeline = [{ $match: { 'fullDocument.members': userId } }];

    Channel.watch(pipeline, { fullDocument: 'updateLookup' }).on(
      'change',
      (data) => {
        const channelData: IChannel = data.fullDocument as IChannel;
        session.push({
          newChannel: JSON.stringify(channelData),
        });
      }
    );
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({
      error: 'Failed to listen to Channel changes',
      details: errorMessage,
    });
  }
};

/**
 * Watch for user being added to a direct message Conversation in the database
 * Send the changes to the client via SSE
 *
 * @param req userId
 */
export const addedToDirectMessageListener = async (
  req: Request,
  res: Response
) => {
  try {
    const userId: string = req.body.userId;
    const session = await createSession(req, res);

    const pipeline = [{ $match: { 'fullDocument.userId': userId } }];

    User.watch(pipeline, { fullDocument: 'updateLookup' }).on(
      'change',
      (data) => {
        const directMessageIds: string[] = data.fullDocument.directMessages;
        const newDirectMessageId =
          directMessageIds[directMessageIds.length - 1];

        session.push({ newDirectMessageId: newDirectMessageId }); // Can get the Conversation from the newDirectMessageId
      }
    );
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({
      error: 'Failed to listen to Conversation changes',
      details: errorMessage,
    });
  }
};

// TODO: add listeners for changes (such as other members joining or other channels being created) to Teams / Channels that the user is a member of
